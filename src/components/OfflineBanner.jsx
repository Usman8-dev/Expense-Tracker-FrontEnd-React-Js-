import { Button } from "primereact/button";
import { WifiOff, RefreshCw, AlertTriangle, CloudUpload } from "lucide-react";
import { useConnectivity } from "../context/useConnectivity";

/**
 * Slim status bar shown only when something needs the user's attention:
 * offline, syncing, queued changes, or failures waiting for a retry.
 */
export default function OfflineBanner() {
  const { online, pending, failed, syncing, syncNow, retryFailed } =
    useConnectivity();

  if (syncing) {
    return (
      <Banner
        tone="info"
        icon={<RefreshCw size={15} className="animate-spin" />}
        text={
          pending > 0
            ? `Syncing ${pending} offline change${pending > 1 ? "s" : ""}…`
            : "Syncing…"
        }
      />
    );
  }

  if (failed > 0) {
    return (
      <Banner
        tone="danger"
        icon={<AlertTriangle size={15} />}
        text={`${failed} change${failed > 1 ? "s" : ""} could not be synced`}
        action={
          <Button
            label="Retry"
            onClick={retryFailed}
            className="!py-1.5 !px-3 !text-xs !rounded-lg !border-0 bg-white/10 hover:bg-white/20 text-white"
          />
        }
      />
    );
  }

  if (!online) {
    return (
      <Banner
        tone="warn"
        icon={<WifiOff size={15} />}
        text={
          pending > 0
            ? `You're offline - ${pending} change${pending > 1 ? "s" : ""} waiting to sync`
            : "You're offline - showing your saved data"
        }
      />
    );
  }

  if (pending > 0) {
    return (
      <Banner
        tone="warn"
        icon={<CloudUpload size={15} />}
        text={`${pending} change${pending > 1 ? "s" : ""} waiting to sync`}
        action={
          <Button
            label="Sync now"
            onClick={syncNow}
            className="!py-1.5 !px-3 !text-xs !rounded-lg !border-0 bg-white/10 hover:bg-white/20 text-white"
          />
        }
      />
    );
  }

  return null;
}

const TONES = {
  info: "bg-sky-500/15 border-sky-500/30 text-sky-200",
  warn: "bg-amber-500/15 border-amber-500/30 text-amber-200",
  danger: "bg-red-500/15 border-red-500/30 text-red-200",
};

function Banner({ tone, icon, text, action }) {
  return (
    <div
      className={`sticky top-0 z-40 mb-4 flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm font-medium backdrop-blur ${TONES[tone]}`}
      role="status"
      aria-live="polite"
    >
      <span className="flex items-center gap-2">
        {icon}
        {text}
      </span>
      {action}
    </div>
  );
}
