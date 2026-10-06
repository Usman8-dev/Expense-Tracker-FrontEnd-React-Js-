import axios from "axios";
import {
  describeOp,
  enqueue,
  uuid,
  applyPendingToList,
  applyPendingToEntity,
  findPendingEntity,
  rememberCategories,
} from "./offlineQueue";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000, // 30 second timeout to allow for cold start
});

const WRITE_METHODS = ["post", "put", "patch", "delete"];

/** Only expense/category writes may be queued; auth + report export never are. */
function isQueueable(config) {
  if (!config) return false;
  const method = String(config.method || "get").toLowerCase();
  if (!WRITE_METHODS.includes(method)) return false;
  return !!describeOp(method, config.url);
}

function asObject(data) {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
}

/** Persist a write in the outbox. Returns the op (or null if not queueable). */
function queueRequest(config, reason) {
  const desc = describeOp(config.method, config.url);
  if (!desc) return null;

  const opId =
    config.headers?.["X-Client-Op-Id"] ||
    config.headers?.["x-client-op-id"] ||
    uuid();

  const op = {
    opId,
    localId: `local_${opId}`,
    method: String(config.method).toUpperCase(),
    url: config.url,
    body: asObject(config.data),
    entity: desc.entity,
    action: desc.action,
    targetId: desc.targetId || null,
    status: "pending",
    attempts: 0,
    createdAt: Date.now(),
    reason, // 'offline' | 'network' | 'server'
  };
  enqueue(op);
  return op;
}

function syntheticResponse(config, op) {
  return {
    data: {
      success: true,
      offline: true,
      queued: true,
      message: "Saved offline - it will sync automatically",
      _id: op ? op.localId : null,
    },
    status: 202,
    statusText: "Queued",
    headers: {},
    config,
    request: {},
  };
}

/* ------------------------------------------------------------------ */
/* read path: merge still-pending offline changes into GET responses    */
/* ------------------------------------------------------------------ */

function looksLikeExpense(entity) {
  return entity && typeof entity === "object" && "title" in entity;
}

function looksLikeCategory(entity) {
  return entity && typeof entity === "object" && "name" in entity && !("title" in entity);
}

/**
 * @returns {'ok' | 'deleted'} 'deleted' means the row was removed offline
 * while it was being edited - the caller should surface "not found".
 */
function mergeSingle(data, entityType, id, key) {
  if (!data || typeof data !== "object") return "ok";

  const wrapped = data[key];
  const current =
    wrapped && typeof wrapped === "object"
      ? wrapped
      : entityType === "expense"
        ? looksLikeExpense(data) && data
        : looksLikeCategory(data) && data;

  if (current) {
    const merged = applyPendingToEntity(entityType, current);
    if (merged === null) return "deleted";
    if (merged !== current) {
      if (wrapped) data[key] = merged;
      else Object.assign(data, merged);
    }
    return "ok";
  }

  // Nothing from the server (cold/offline): fall back to the outbox.
  const pending = findPendingEntity(entityType, id);
  if (pending) {
    data[key] = pending;
    if (!("success" in data)) data.success = true;
  }
  return "ok";
}

function mergePendingReads(response) {
  const config = response.config || {};
  const method = String(config.method || "get").toLowerCase();
  const data = response.data;
  if (method !== "get" || !data || typeof data !== "object") return response;

  const url = String(config.url || "").split("?")[0];

  if (url.includes("/expense/AllExpense")) {
    data.All_Expenses = applyPendingToList("expense", data.All_Expenses || []);
  } else if (url.includes("/category/AllCategory")) {
    const list = data.All_Categories || data.categories || [];
    rememberCategories(list);
    const merged = applyPendingToList("category", list);
    if (data.All_Categories) data.All_Categories = merged;
    else if (data.categories) data.categories = merged;
    else data.All_Categories = merged;
  } else if (url.includes("/expense/GetExpenseById/")) {
    const id = url.split("/").filter(Boolean).pop();
    if (mergeSingle(data, "expense", id, "expense") === "deleted") {
      return Promise.reject(
        Object.assign(new Error("Transaction was deleted offline"), {
          response: { data: { message: "This transaction was deleted offline" } },
        })
      );
    }
  } else if (url.includes("/category/GetCategoryById/")) {
    const id = url.split("/").filter(Boolean).pop();
    if (mergeSingle(data, "category", id, "category") === "deleted") {
      return Promise.reject(
        Object.assign(new Error("Category was deleted offline"), {
          response: { data: { message: "This category was deleted offline" } },
        })
      );
    }
  }

  return response;
}

/* ------------------------------------------------------------------ */
/* interceptors                                                         */
/* ------------------------------------------------------------------ */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Idempotency key: lets the backend dedupe a replayed write.
  if (isQueueable(config)) {
    config.headers["X-Client-Op-Id"] =
      config.headers["X-Client-Op-Id"] || uuid();
  }

  // Offline + a queueable write -> short-circuit into the outbox.
  // The rejection is turned into a synthetic success by the error handler.
  if (!config._sync && isQueueable(config) && !navigator.onLine) {
    config._offlineQueued = true;
    return Promise.reject({ config, __offlineQueued: true, message: "Offline" });
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    try {
      return mergePendingReads(response);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    const config = error.config;

    // 1. Request was short-circuited because we are offline.
    if (error.__offlineQueued || config?._offlineQueued) {
      const op = queueRequest(config, "offline");
      if (op) return Promise.resolve(syntheticResponse(config, op));
      return Promise.reject(error);
    }

    const method = String(config?.method || "get").toLowerCase();
    const status = error.response?.status;
    const retried = config && (config._retried || config._retryCount > 0);

    // 2. Retry once on network errors / 5xx (Render free-tier cold start).
    const shouldRetry =
      config &&
      !retried &&
      !config._sync &&
      navigator.onLine &&
      (!error.response || status >= 500);

    if (shouldRetry) {
      config._retried = true;
      config._retryCount = (config._retryCount || 0) + 1;
      return new Promise((resolve) => {
        setTimeout(() => resolve(api(config)), 2000);
      });
    }

    // 3. Backend unreachable / still booting -> park the write in the outbox.
    if (!config._sync && isQueueable(config) && (!status || status >= 500)) {
      const op = queueRequest(config, status ? "server" : "network");
      if (op) return Promise.resolve(syntheticResponse(config, op));
    }

    // 4. Reading an offline-created row that the server has never seen.
    if (method === "get" && !error.response && config?.url) {
      const url = String(config.url).split("?")[0];
      const entityType = url.includes("/expense/")
        ? "expense"
        : url.includes("/category/")
          ? "category"
          : null;
      if (entityType) {
        const id = url.split("/").filter(Boolean).pop();
        const pending = findPendingEntity(entityType, id);
        if (pending) {
          return Promise.resolve({
            data: { success: true, offline: true, [entityType]: pending },
            status: 200,
            statusText: "OK",
            headers: {},
            config,
            request: {},
          });
        }
      }
    }

    // 5. Session expired - only bounce to login when we actually have a connection.
    if (status === 401 && navigator.onLine) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
