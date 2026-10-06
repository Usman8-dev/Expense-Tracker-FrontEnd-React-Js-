import { useEffect, useMemo, useState } from "react";
import { ConnectivityContext } from "./useConnectivity";
import { subscribe, counts } from "../apis/offlineQueue";
import {
  startSyncEngine,
  onSyncState,
  syncNow,
  retryFailed,
} from "../apis/syncManager";
import { useToast } from "./ToastContext";

/**
 * Single source of truth for "are we online?" + "what is waiting to sync?".
 * Also starts the background sync engine and announces successful syncs.
 */
export function ConnectivityProvider({ children }) {
  const showToast = useToast();

  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [queue, setQueue] = useState(() => counts());
  const [sync, setSync] = useState({ status: "idle", reason: null });

  // Outbox mutations (enqueue / dequeue) -> re-render the banner.
  useEffect(() => subscribe(() => setQueue(counts())), []);

  // Sync engine lifecycle + state stream.
  useEffect(() => {
    startSyncEngine();
    return onSyncState((state) => {
      setSync({ status: state.status, reason: state.reason });
      setQueue(counts());
    });
  }, []);

  // Connectivity events.
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // One-time confirmation after a successful drain.
  useEffect(() => {
    const onSynced = (event) => {
      const count = event.detail?.count || 0;
      if (!count) return;
      showToast({
        severity: "success",
        summary: "Synced",
        detail: `${count} offline change${count > 1 ? "s" : ""} synced successfully`,
        life: 3000,
      });
    };
    window.addEventListener("expenseflow:synced", onSynced);
    return () => window.removeEventListener("expenseflow:synced", onSynced);
  }, [showToast]);

  const value = useMemo(
    () => ({
      online,
      pending: queue.pending,
      failed: queue.failed,
      syncing: sync.status === "syncing",
      syncReason: sync.reason,
      syncNow,
      retryFailed,
    }),
    [online, queue.pending, queue.failed, sync.status, sync.reason]
  );

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
    </ConnectivityContext.Provider>
  );
}
