/**
 * Fixed-window rate limit kept in the memory of this Next.js instance. It is a
 * first line of defense in front of a shared backend budget (e.g. the cached
 * catalog search, ADR-0041): each instance limits its own visitors, and the
 * backend still caps the BFF as a whole.
 */
type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();
// NOTE: bounds memory under a flood of distinct keys (IPs); expired windows are dropped first.
const MAX_TRACKED_KEYS = 10_000;

function sweep(now: number) {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
  if (windows.size >= MAX_TRACKED_KEYS) windows.clear();
}

/**
 * Counts one request for `key`.
 *
 * @returns `allowed: false` with the seconds until the window resets once the
 * limit is exceeded.
 */
export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): { allowed: boolean; retryAfterSeconds: number } {
  let window = windows.get(key);
  if (!window || window.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_KEYS) sweep(now);
    window = { count: 0, resetAt: now + windowMs };
    windows.set(key, window);
  }
  window.count += 1;
  return {
    allowed: window.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((window.resetAt - now) / 1000)),
  };
}

/** Clears every window (tests). */
export function resetRateLimits() {
  windows.clear();
}
