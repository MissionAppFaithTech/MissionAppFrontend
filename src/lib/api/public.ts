import { BackendApiError } from '@/lib/api/backend';
import { BFF_SECRET_HEADER } from '@/lib/api/clientIp';
import { getBackendApiBase } from '@/lib/api/config';

/**
 * Anonymous read of a public backend endpoint, for `'use cache'` functions
 * (ADR-0004). It never reads cookies or request headers and never sends a
 * token, so the result can be shared by every visitor. The BFF secret without
 * an end-user IP puts these reads in the Next.js server's own rate-limit budget
 * (backend ADR-0036).
 */
export async function publicBackendFetch<T>(path: string): Promise<T> {
  const secret = process.env.BFF_SHARED_SECRET;
  const response = await fetch(`${getBackendApiBase()}${path}`, {
    headers: {
      Accept: 'application/json',
      'x-client-type': 'web',
      ...(secret ? { [BFF_SECRET_HEADER]: secret } : {}),
    },
  });

  const payload: unknown = (response.headers.get('content-type') ?? '').includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : `Erro na API (${response.status})`;
    throw new BackendApiError(message, response.status, payload);
  }
  return payload as T;
}
