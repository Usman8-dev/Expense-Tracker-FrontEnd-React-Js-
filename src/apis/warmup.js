// Warm-up utility to keep the Render backend awake and reduce cold start delays
const WARMUP_INTERVAL = 10 * 60 * 1000; // 10 minutes
const WARMUP_KEY = "last_warmup_time";

/**
 * Pings the backend to wake it up from Render's free tier cold start.
 * This should be called when the app loads and periodically.
 */
export function warmupBackend() {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) return;

  // Check if we've warmed up recently to avoid unnecessary requests
  const lastWarmup = localStorage.getItem(WARMUP_KEY);
  const now = Date.now();

  if (lastWarmup && now - parseInt(lastWarmup) < WARMUP_INTERVAL) {
    return;
  }

  // Fire a lightweight request to wake up the server
  // Use a short timeout so it doesn't block the app
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  // Try common health check endpoints first, then fall back to a simple GET
  const endpoints = ["/health", "/api/health", "/", "/user/login"];

  const tryEndpoint = (index) => {
    if (index >= endpoints.length) {
      // All endpoints failed - server might be down, but that's ok
      // The actual login request will still work when the user submits
      return;
    }

    fetch(`${apiUrl}${endpoints[index]}`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    })
      .then(() => {
        localStorage.setItem(WARMUP_KEY, String(Date.now()));
      })
      .catch(() => {
        // Try next endpoint
        tryEndpoint(index + 1);
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });
  };

  tryEndpoint(0);
}

/**
 * Starts periodic warm-up to keep the server awake.
 * Call this once when the app initializes.
 */
export function startWarmupScheduler() {
  // Initial warm-up on app load
  warmupBackend();

  // Periodic warm-up every 10 minutes
  setInterval(warmupBackend, WARMUP_INTERVAL);
}