// Offline outbox: durable queue of write operations created while offline,
// plus small lookup maps (localId -> serverId, categoryId -> name) needed to
// replay those operations and render them before they reach the server.
//
// Everything lives in localStorage: the queue is tiny (a handful of ops),
// synchronous reads keep the Axios interceptors simple, and it survives
// reloads / browser restarts exactly like the existing auth token does.

const OUTBOX_KEY = "expenseflow.outbox.v1";
const ID_MAP_KEY = "expenseflow.idmap.v1";
const CAT_NAMES_KEY = "expenseflow.catnames.v1";

/* ------------------------------------------------------------------ */
/* storage helpers                                                     */
/* ------------------------------------------------------------------ */

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Quota exceeded or private mode - never crash the UI over the queue.
    console.warn("[offlineQueue] could not persist", key, error);
  }
}

const listeners = new Set();

function emit() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* a broken listener must not break the queue */
    }
  });
}

/** Subscribe to any queue change (add/remove/clear). Returns unsubscribe. */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/* ------------------------------------------------------------------ */
/* operation inspection                                                 */
/* ------------------------------------------------------------------ */

/**
 * Classify a write so we know (a) whether it can be queued offline and
 * (b) how to project it into a list while it is still pending.
 * Returns null for anything we must never queue (auth, report export...).
 */
export function describeOp(method, methodUrl) {
  if (!method || !methodUrl) return null;
  const verb = String(method).toUpperCase();
  if (verb === "GET" || verb === "HEAD") return null;

  const url = String(methodUrl).split("?")[0];
  const isExpense = url.startsWith("/expense/");
  const isCategory = url.startsWith("/category/");
  if (!isExpense && !isCategory) return null;

  const entity = isExpense ? "expense" : "category";
  const parts = url.split("/").filter(Boolean); // e.g. ['expense','create']

  if (verb === "POST" && parts[1] === "create") {
    return { entity, action: "create" };
  }
  if (verb === "PUT" && parts[1] === "update") {
    return { entity, action: "update", targetId: parts[2] || null };
  }
  if (verb === "DELETE" && parts[1] === "delete") {
    return { entity, action: "delete", targetId: parts[2] || null };
  }
  // POST /expense/export and anything else -> never queued
  return null;
}

/* ------------------------------------------------------------------ */
/* the queue itself                                                     */
/* ------------------------------------------------------------------ */

export function listQueue() {
  return read(OUTBOX_KEY, []);
}

function save(list) {
  write(OUTBOX_KEY, list);
  emit();
}

export function enqueue(op) {
  const list = listQueue();
  list.push(op);
  save(list);
  return op;
}

export function updateOp(opId, patch) {
  const list = listQueue();
  const index = list.findIndex((op) => op.opId === opId);
  if (index === -1) return null;
  list[index] = { ...list[index], ...patch };
  save(list);
  return list[index];
}

export function removeOp(opId) {
  const list = listQueue();
  const next = list.filter((op) => op.opId !== opId);
  if (next.length === list.length) return false;
  save(next);
  return true;
}

export function clearQueue() {
  save([]);
}

export function counts() {
  const list = listQueue();
  return {
    pending: list.filter((op) => op.status !== "failed").length,
    failed: list.filter((op) => op.status === "failed").length,
    total: list.length,
  };
}

export function findPendingEntity(entity, id) {
  if (!id) return null;
  const op = listQueue().find(
    (o) => o.entity === entity && o.action === "create" && o.localId === id
  );
  return op ? projectCreate(op) : null;
}

/** Re-arm every failed op so the user can retry them manually. */
export function retryAllFailed() {
  const list = listQueue().map((op) =>
    op.status === "failed" ? { ...op, status: "pending", lastError: null } : op
  );
  save(list);
}

/* ------------------------------------------------------------------ */
/* localId -> serverId map                                              */
/* ------------------------------------------------------------------ */

export function recordId(localId, serverId) {
  if (!localId || !serverId || localId === serverId) return;
  const map = read(ID_MAP_KEY, {});
  map[localId] = serverId;
  write(ID_MAP_KEY, map);
}

export function mapId(id) {
  if (typeof id !== "string") return id;
  const map = read(ID_MAP_KEY, {});
  return map[id] || id;
}

/** Rewrite localIds that appear *inside* a string (e.g. /expense/update/local_x). */
function remapString(str) {
  const map = read(ID_MAP_KEY, {});
  const keys = Object.keys(map);
  if (!keys.length) return str;
  if (map[str]) return map[str];
  let out = str;
  keys.forEach((local) => {
    out = out.split(local).join(map[local]);
  });
  return out;
}

/** Deeply rewrite every known localId in a payload / url before replay. */
export function remapDeep(value) {
  if (typeof value === "string") return remapString(value);
  if (Array.isArray(value)) return value.map(remapDeep);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = remapDeep(v);
    return out;
  }
  return value;
}

export function clearIdMap() {
  write(ID_MAP_KEY, {});
}

/* ------------------------------------------------------------------ */
/* category name cache (so offline rows still show their category)      */
/* ------------------------------------------------------------------ */

export function rememberCategories(list) {
  if (!Array.isArray(list) || !list.length) return;
  const map = read(CAT_NAMES_KEY, {});
  let changed = false;
  list.forEach((cat) => {
    const id = cat?._id || cat?.id;
    if (id && typeof cat.name === "string") {
      map[id] = cat.name;
      changed = true;
    }
  });
  if (changed) write(CAT_NAMES_KEY, map);
}

export function categoryName(id) {
  if (!id) return "";
  if (typeof id === "object") return id.name || "";
  const resolved = mapId(id);
  const map = read(CAT_NAMES_KEY, {});
  if (map[resolved]) return map[resolved];
  // Category may itself have been created offline and not synced yet.
  const pending = listQueue().find(
    (op) => op.entity === "category" && op.action === "create" && op.localId === id
  );
  return pending?.body?.name || map[id] || "";
}

export function clearCategoryNames() {
  write(CAT_NAMES_KEY, {});
}

/** Wipe every trace of offline data (logout / user switch). */
export function clearAllOfflineData() {
  clearQueue();
  clearIdMap();
  clearCategoryNames();
}

/* ------------------------------------------------------------------ */
/* projection: pending ops -> entity objects the UI can render          */
/* ------------------------------------------------------------------ */

function categoryRef(id) {
  if (!id) return id;
  if (typeof id === "object") return id;
  const name = categoryName(id);
  return name ? { _id: mapId(id), name } : id;
}

function projectCreate(op) {
  const body = op.body || {};
  if (op.entity === "expense") {
    return {
      _id: op.localId,
      title: body.title || "",
      description: body.description || "",
      amount: Number(body.amount) || 0,
      type: body.type || "Expense",
      category_id: categoryRef(body.category_id),
      date: body.date || op.createdAt,
      __pending: true,
    };
  }
  return {
    _id: op.localId,
    name: body.name || "",
    __pending: true,
  };
}

function projectUpdate(entity, op) {
  const body = op.body || {};
  const patch = { ...body, __pending: true };
  if (op.entity === "expense" && "category_id" in body) {
    patch.category_id = categoryRef(body.category_id);
  }
  if (op.entity === "expense" && !("category_id" in body) && entity.category_id) {
    patch.category_id = categoryRef(entity.category_id);
  }
  return patch;
}

function applyOps(entity, ops) {
  let out = entity;
  ops.forEach((op) => {
    out = { ...out, ...projectUpdate(entity, op), _id: out._id ?? entity._id };
  });
  return out;
}

/** Merge pending ops into a single entity fetched from the server. */
export function applyPendingToEntity(entityType, entity) {
  if (!entity) return entity;
  const id = entity._id || entity.id;
  const ops = listQueue().filter(
    (op) => op.entity === entityType && op.action === "update" && op.targetId === id
  );
  const deleted = listQueue().some(
    (op) => op.entity === entityType && op.action === "delete" && op.targetId === id
  );
  if (deleted) return null;
  if (!ops.length) return entity;
  return applyOps(entity, ops);
}

/**
 * Merge pending ops into a list response:
 *  - offline creates are prepended (with their local id)
 *  - offline updates are applied onto their row
 *  - offline deletes are filtered out
 */
export function applyPendingToList(entityType, list) {
  const base = Array.isArray(list) ? list : [];
  const ops = listQueue().filter((op) => op.entity === entityType);

  const updates = new Map();
  const deletes = new Set();
  ops.forEach((op) => {
    if (op.action === "update" && op.targetId) updates.set(op.targetId, op);
    if (op.action === "delete" && op.targetId) deletes.add(op.targetId);
  });

  const present = new Set(base.map((row) => row?._id || row?.id));

  const creates = ops
    .filter(
      (op) =>
        op.action === "create" &&
        !deletes.has(op.localId) &&
        !present.has(op.localId)
    )
    .map((op) => projectCreate(op))
    .map((row) => (updates.has(row._id) ? applyOps(row, [updates.get(row._id)]) : row));

  const rows = base
    .filter((row) => !deletes.has(row?._id || row?.id))
    .map((row) => {
      const op = updates.get(row?._id || row?.id);
      return op ? applyOps(row, [op]) : row;
    });

  // Newest offline entries first so "latest 5" on the dashboard includes them.
  return [...creates, ...rows];
}

export default {
  subscribe,
  listQueue,
  enqueue,
  updateOp,
  removeOp,
  clearQueue,
  counts,
  describeOp,
  findPendingEntity,
  retryAllFailed,
  recordId,
  mapId,
  remapDeep,
  rememberCategories,
  categoryName,
  clearAllOfflineData,
  applyPendingToEntity,
  applyPendingToList,
};
