// Smoke test for the offline outbox logic (no browser required).
// Run:  npm run test:offline
// Covers: op classification, pending projection, list merging, id remapping.

import assert from "node:assert/strict";

/* ---- minimal browser shims ---------------------------------------- */
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};

const q = await import("../src/apis/offlineQueue.js");

/* ---- 1. op classification ------------------------------------------ */
assert.equal(q.describeOp("POST", "/expense/create").action, "create");
assert.equal(q.describeOp("PUT", "/expense/update/abc123").targetId, "abc123");
assert.equal(q.describeOp("DELETE", "/category/delete/x").entity, "category");
assert.equal(q.describeOp("POST", "/expense/export"), null, "report must never queue");
assert.equal(q.describeOp("POST", "/user/login"), null, "auth must never queue");
assert.equal(q.describeOp("GET", "/expense/AllExpense"), null, "reads are never queued");

/* ---- 2. offline create appears in the list -------------------------- */
q.enqueue({
  opId: "op-1",
  localId: "local_op-1",
  method: "POST",
  url: "/expense/create",
  body: { title: "Chai", amount: 120, type: "Expense", category_id: "local_cat", date: "2026-10-06" },
  entity: "expense",
  action: "create",
  status: "pending",
  attempts: 0,
  createdAt: Date.now(),
});

let merged = q.applyPendingToList("expense", []);
assert.equal(merged.length, 1);
assert.equal(merged[0]._id, "local_op-1");
assert.equal(merged[0].title, "Chai");
assert.equal(merged[0].__pending, true);

/* ---- 3. offline update applies onto a server row --------------------- */
q.enqueue({
  opId: "op-2",
  localId: "local_op-2",
  method: "PUT",
  url: "/expense/update/srv-1",
  body: { title: "Chai (edited)", amount: 150 },
  entity: "expense",
  action: "update",
  targetId: "srv-1",
  status: "pending",
  attempts: 0,
  createdAt: Date.now(),
});

merged = q.applyPendingToList("expense", [
  { _id: "srv-1", title: "Chai", amount: 120, type: "Expense" },
  { _id: "srv-2", title: "Salary", amount: 50000, type: "Income" },
]);
assert.equal(merged.length, 3, "pending create + 2 server rows");
assert.equal(merged[0]._id, "local_op-1", "offline create stays visible");
const edited = merged.find((r) => r._id === "srv-1");
assert.equal(edited.title, "Chai (edited)");
assert.equal(edited.amount, 150);
assert.equal(edited.__pending, true);
assert.equal(merged.find((r) => r._id === "srv-2").title, "Salary", "untouched rows stay intact");

/* ---- 4. offline delete hides the row -------------------------------- */
q.enqueue({
  opId: "op-3",
  localId: "local_op-3",
  method: "DELETE",
  url: "/expense/delete/srv-2",
  entity: "expense",
  action: "delete",
  targetId: "srv-2",
  status: "pending",
  attempts: 0,
  createdAt: Date.now(),
});
merged = q.applyPendingToList("expense", [
  { _id: "srv-1", title: "Chai" },
  { _id: "srv-2", title: "Salary" },
]);
assert.deepEqual(
  merged.map((r) => r._id),
  ["local_op-1", "srv-1"],
  "deleted row removed, offline create still listed"
);

/* ---- 5. offline category name resolution ---------------------------- */
q.enqueue({
  opId: "op-4",
  localId: "local_cat",
  method: "POST",
  url: "/category/create",
  body: { name: "Food" },
  entity: "category",
  action: "create",
  status: "pending",
  attempts: 0,
  createdAt: Date.now(),
});
assert.equal(q.categoryName("local_cat"), "Food", "pending category name resolves");
const catList = q.applyPendingToList("category", []);
assert.equal(catList[0].name, "Food");

/* ---- 6. create -> edit chain remaps localId on replay ---------------- */
const expenseOps = q.listQueue().filter((op) => op.entity === "expense");
const updateOp = expenseOps.find((op) => op.action === "update");
const createCatOp = q.listQueue().find((op) => op.action === "create" && op.entity === "category");
assert.ok(createCatOp, "category create queued");

q.recordId(createCatOp.localId, "srv_cat_9");
assert.equal(q.remapDeep("/category/update/local_cat"), "/category/update/srv_cat_9");
assert.deepEqual(q.remapDeep({ category_id: "local_cat" }), { category_id: "srv_cat_9" });
assert.equal(q.remapDeep({ category_id: "srv-2" }).category_id, "srv-2", "server ids untouched");
assert.equal(updateOp.url, "/expense/update/srv-1");

/* ---- 7. single-entity projection + deleted marker -------------------- */
const pendingExpense = q.findPendingEntity("expense", "local_op-1");
assert.equal(pendingExpense.title, "Chai");
assert.equal(q.findPendingEntity("expense", "does-not-exist"), null);
const afterDelete = q.applyPendingToEntity("expense", { _id: "srv-2", title: "Salary" });
assert.equal(afterDelete, null, "deleted offline -> entity reports gone");

/* ---- 8. counters + full purge --------------------------------------- */
assert.equal(q.counts().total, 4); // create + update + delete + category
q.clearAllOfflineData();
assert.equal(q.counts().total, 0);
assert.equal(q.listQueue().length, 0);
assert.equal(q.mapId("local_cat"), "local_cat", "id map cleared");
assert.equal(q.categoryName("local_cat"), "", "category cache cleared");

console.log("offlineQueue smoke test: all assertions passed ✅");
