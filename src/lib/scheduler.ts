/**
 * Modern scheduler utility for breaking up long tasks and improving INP (Interaction to Next Paint).
 * Uses native `scheduler.yield()` when supported, with a graceful fallback for older environments.
 * @see https://developer.chrome.com/docs/capabilities/web-apis/scheduler-yield
 */
export async function yieldToMain(): Promise<void> {
  if (
    typeof window !== 'undefined' &&
    'scheduler' in window &&
    typeof (window as unknown as { scheduler: { yield?: () => Promise<void> } }).scheduler
      ?.yield === 'function'
  ) {
    return (window as unknown as { scheduler: { yield: () => Promise<void> } }).scheduler.yield();
  }

  // Graceful fallback for non-supporting browsers and Node/test environments
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
