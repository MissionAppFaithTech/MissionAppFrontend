import { QueryClient, environmentManager } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';

/** Defaults of ADR-0002. */
export const DEFAULT_STALE_TIME_MS = 30_000;

/** No retry for 4xx (401, 423 and 429 included); one more try for network errors and 5xx. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 1;
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: DEFAULT_STALE_TIME_MS, retry: shouldRetry },
      mutations: { retry: false },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * One client per request on the server, so users never share a cache, and a
 * single one in the browser, so the cache survives navigations (ADR-0002).
 */
export function getQueryClient(): QueryClient {
  if (environmentManager.isServer()) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
