import type { BffErrorBody } from '@/lib/api/errors';

/** Error thrown by browser → BFF calls, carrying field errors for forms. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const SESSION_EXPIRED_EVENT = 'missionapp:session-expired';

type BffRequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  fallbackMessage: string;
};

/**
 * Calls a Next.js BFF route (`/api/...`) and returns the parsed JSON body.
 * A 401 means the session is gone: it dispatches {@link SESSION_EXPIRED_EVENT}
 * so the session store can log out, then throws.
 */
export async function bffRequest<T>(path: string, options: BffRequestOptions): Promise<T> {
  const { method = 'GET', body, fallbackMessage } = options;

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError('Não foi possível conectar. Verifique sua internet e tente novamente.', 0);
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = (payload ?? {}) as Partial<BffErrorBody>;
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    throw new ApiError(
      typeof error.message === 'string' && error.message ? error.message : fallbackMessage,
      response.status,
      error.fieldErrors ?? {}
    );
  }

  return payload as T;
}
