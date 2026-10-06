import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X } from "lucide-react";

/**
 * Service-worker lifecycle UI:
 *  - "Ready to work offline" once the shell is precached
 *  - "New version available" prompt when a new build is waiting
 *    (registerType: 'prompt' -> we decide when to reload, never mid-edit)
 */
export default function PwaUpdatePrompt() {
  const [hideReady, setHideReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const {
    offlineReady: ready,
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      // Periodically look for a new build while the tab stays open.
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000); // hourly
      }
    },
  });

  // Auto-dismiss the "ready offline" notice a few seconds after it appears.
  useEffect(() => {
    if (!ready) return undefined;
    const timer = setTimeout(() => setHideReady(true), 5000);
    return () => clearTimeout(timer);
  }, [ready]);

  if (needRefresh && !dismissed) {
    return (
      <Toast>
        <span className="flex items-center gap-2">
          <RefreshCw size={15} className="text-emerald-400" />
          A new version of ExpenseFlow is available
        </span>
        <span className="flex items-center gap-2">
          <button
            onClick={() => updateServiceWorker(true)}
            className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30"
          >
            Reload
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Later"
            className="text-slate-400 hover:text-white"
          >
            <X size={15} />
          </button>
        </span>
      </Toast>
    );
  }

  if (ready && !hideReady) {
    return (
      <Toast>
        <span className="flex items-center gap-2">
          <RefreshCw size={15} className="text-emerald-400" />
          Ready to work offline
        </span>
        <button
          onClick={() => setHideReady(true)}
          aria-label="Dismiss"
          className="text-slate-400 hover:text-white"
        >
          <X size={15} />
        </button>
      </Toast>
    );
  }

  return null;
}

function Toast({ children }) {
  return (
    <div className="fixed bottom-20 right-4 z-50 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 text-sm text-slate-200 shadow-2xl backdrop-blur md:bottom-6">
      {children}
    </div>
  );
}
