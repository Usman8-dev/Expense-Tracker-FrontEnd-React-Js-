// Drains the offline outbox against the API, in FIFO order, one request at
// a time so create -> edit -> delete chains replay in the right order.
//
// Triggers: app start, `online` event, tab becoming visible, manual "Sync now".

import {
  listQueue,
  updateOp,
  removeOp,
  recordId,
  remapDeep,
  counts,
  retryAllFailed,
} from "./offlineQueue";

const MAX_ATTEMPTS = 5;
const BACKOFF_BASE = 2000; // 2s, 4s, 8s, 16s, 32s

let state = {
  status: "idle", // idle | syncing | error
  reason: null, // offline | auth | server | null
  pending: 0,
  failed: 0,
  syncedCount: 0,
  lastSyncedAt: null,
  error: null,
};

const listeners = new Set();

function setState(patch) {
  state = { ...state, ...patch, ...counts() };
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch {
      /* ignore listener errors */
    }
  });
}

/** Subscribe to sync/queue state. Immediately invoked with current state. */
export function onSyncState(fn) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

export function getSyncState() {
  return { ...state, ...counts() };
}

/* ------------------------------------------------------------------ */

let draining = false;
let retryTimer = null;
let debounceTimer = null;

export function requestSync(delay = 250) {
  if (typeof window === "undefined") return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (!navigator.onLine) {
      setState({ status: "idle", reason: "offline" });
      return;
    }
    if (!listQueue().length) {
      setState({ status: "idle", reason: null, error: null });
      return;
    }
    drain();
  }, delay);
}

function scheduleRetry() {
  clearTimeout(retryTimer);
  const pendingOps = listQueue().filter((op) => op.status === "pending");
  if (!pendingOps.length) return;
  const attempts = Math.min(
    4,
    ...pendingOps.map((op) => op.attempts || 0)
  );
  const wait = BACKOFF_BASE * Math.pow(2, attempts);
  retryTimer = setTimeout(() => requestSync(0), wait);
}

function extractServerId(data, entity) {
  const candidates = [
    data?.expense?._id,
    data?.category?._id,
    data?.data?._id,
    data?.data?.expense?._id,
    data?.data?.category?._id,
    data?.created?._id,
    data?._id,
  ];
  const id = candidates.find((value) => typeof value === "string" && value);
  if (id) return id;
  console.warn(
    `[sync] ${entity} created but the response carried no id - ` +
      "offline references to it cannot be remapped."
  );
  return null;
}

function errorMessage(error) {
  return (
    error?.response?.data?.message || error?.message || "Sync failed"
  );
}

async function drain() {
  if (draining) return;
  draining = true;
  setState({ status: "syncing", reason: null, error: null });

  // Dynamic import keeps the module graph acyclic (axios imports us too).
  const { default: api } = await import("./axios");

  let synced = 0;
  let stopReason = null;

  try {
    for (;;) {
      if (!navigator.onLine) {
        stopReason = "offline";
        break;
      }

      const op = listQueue().find((o) => o.status === "pending");
      if (!op) break;

      updateOp(op.opId, { status: "syncing" });

      try {
        const url = remapDeep(op.url);
        const data = op.body !== undefined ? remapDeep(op.body) : undefined;

        const response = await api.request({
          method: op.method,
          url,
          data,
          headers: { "X-Client-Op-Id": op.opId },
          _sync: true, // tells axios: never queue this, never loop retries
        });

        if (op.action === "create") {
          const serverId = extractServerId(response?.data, op.entity);
          if (serverId) recordId(op.localId, serverId);
        }

        removeOp(op.opId);
        synced += 1;
      } catch (error) {
        const status = error?.response?.status;

        if (!error?.response) {
          // Definite network failure -> safe to retry later.
          updateOp(op.opId, {
            status: "pending",
            attempts: (op.attempts || 0) + 1,
            lastError: "network",
          });
          stopReason = "offline";
          scheduleRetry();
          break;
        }

        if (status === 401 || status === 403) {
          // Token expired - hold the queue until the user logs back in.
          updateOp(op.opId, { status: "pending", lastError: "auth" });
          stopReason = "auth";
          break;
        }

        if (status === 404 && (op.action === "update" || op.action === "delete")) {
          // Target no longer exists on the server: the op is already satisfied.
          removeOp(op.opId);
          continue;
        }

        if (status >= 400 && status < 500) {
          // Permanent rejection (validation / bad reference): park it for review.
          updateOp(op.opId, {
            status: "failed",
            lastError: errorMessage(error),
          });
          continue;
        }

        // 5xx - the backend may still be booting. Back off and retry.
        const attempts = (op.attempts || 0) + 1;
        if (attempts >= MAX_ATTEMPTS) {
          updateOp(op.opId, {
            status: "failed",
            lastError: errorMessage(error),
          });
          continue;
        }
        updateOp(op.opId, {
          status: "pending",
          attempts,
          lastError: errorMessage(error),
        });
        stopReason = "server";
        scheduleRetry();
        break;
      }
    }
  } finally {
    draining = false;
    setState({
      status: stopReason && stopReason !== "offline" ? "error" : "idle",
      reason: stopReason,
      error: stopReason && stopReason !== "offline" ? state.error : null,
      syncedCount: synced,
      lastSyncedAt: synced ? Date.now() : state.lastSyncedAt,
    });
    if (synced > 0 && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("expenseflow:synced", { detail: { count: synced } })
      );
    }
  }
}

/** Manual "Sync now" button. */
export function syncNow() {
  requestSync(0);
}

export function retryFailed() {
  retryAllFailed();
  requestSync(0);
}

/** Wire up the automatic triggers. Call once, from ConnectivityProvider. */
export function startSyncEngine() {
  if (typeof window === "undefined" || startSyncEngine.started) return;
  startSyncEngine.started = true;

  window.addEventListener("online", () => requestSync(0));
  window.addEventListener("offline", () =>
    setState({ status: "idle", reason: "offline" })
  );
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) requestSync(400);
  });

  setState({ ...counts(), reason: navigator.onLine ? null : "offline" });
  if (navigator.onLine) requestSync(600);
}
