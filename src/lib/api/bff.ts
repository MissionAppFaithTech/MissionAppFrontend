import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { toBffError } from '@/lib/api/errors';
import { AUTH_COOKIE, applyAuthCookies, clearAuthCookies } from '@/lib/auth/cookies';
import { isAccessTokenExpiring } from '@/lib/auth/jwt';

type AuthTokens = { accessToken: string; refreshToken: string };

// BFF validation messages reach the UI as `fieldErrors`: keep them in Portuguese.
z.config(z.locales.pt());

const SESSION_EXPIRED_MESSAGE = 'Sua sessão expirou. Entre novamente para continuar.';

/**
 * Concurrent refreshes with the same refresh token would trip the backend's
 * reuse detection and revoke the whole session family, so they share one call.
 */
const inflightRefreshes = new Map<string, Promise<AuthTokens>>();

/**
 * A request sent with the old cookie can arrive just after another one rotated it.
 * Remembering the rotation for a short window hands it the new tokens instead of
 * replaying the consumed refresh token.
 */
const recentRotations = new Map<string, { tokens: AuthTokens; expiresAt: number }>();
export const ROTATION_REUSE_WINDOW_MS = 30_000;

/** Forgets in-flight and recent refreshes (tests; process-local state otherwise). */
export function clearRefreshCache() {
  inflightRefreshes.clear();
  recentRotations.clear();
}

export function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const recent = recentRotations.get(refreshToken);
  if (recent && recent.expiresAt > Date.now()) return Promise.resolve(recent.tokens);
  recentRotations.delete(refreshToken);

  const pending = inflightRefreshes.get(refreshToken);
  if (pending) return pending;

  const request = backendFetch<{ data: AuthTokens }>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  })
    .then((result) => {
      recentRotations.set(refreshToken, {
        tokens: result.data,
        expiresAt: Date.now() + ROTATION_REUSE_WINDOW_MS,
      });
      return result.data;
    })
    .finally(() => {
      inflightRefreshes.delete(refreshToken);
    });

  inflightRefreshes.set(refreshToken, request);
  return request;
}

/** Maps any thrown error to a JSON response; non-backend failures become 502. */
export function bffErrorResponse(error: unknown, fallbackMessage: string, tag: string) {
  if (error instanceof BackendApiError) {
    return NextResponse.json(toBffError(error.status, error.body, fallbackMessage), {
      status: error.status,
    });
  }

  console.error(`[${tag}]`, error);
  return NextResponse.json({ message: fallbackMessage }, { status: 502 });
}

type ParsedBody<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

/** Reads and validates a JSON body, answering 400/422 with a pt-BR message. */
export async function readJsonBody<S extends z.ZodType>(
  request: Request,
  schema: S,
  invalidMessage: string
): Promise<ParsedBody<z.output<S>>> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ message: 'JSON inválido' }, { status: 400 }),
    };
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === 'string' && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return {
      ok: false,
      response: NextResponse.json({ message: invalidMessage, fieldErrors }, { status: 422 }),
    };
  }

  return { ok: true, data: parsed.data };
}

function sessionExpiredResponse() {
  const response = NextResponse.json({ message: SESSION_EXPIRED_MESSAGE }, { status: 401 });
  clearAuthCookies(response);
  return response;
}

/**
 * Runs `handler` with the session access token. Refreshes the token when it is
 * missing/expiring or when the backend answers 401, retries once, and rewrites
 * the auth cookies. A failed refresh clears the cookies and answers 401.
 */
export async function withSession(
  tag: string,
  fallbackMessage: string,
  handler: (accessToken: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const store = await cookies();
  let accessToken = store.get(AUTH_COOKIE.accessToken)?.value;
  const refreshToken = store.get(AUTH_COOKIE.refreshToken)?.value;
  let refreshed: AuthTokens | undefined;
  let refreshAttempted = false;

  const refresh = async () => {
    if (!refreshToken || refreshAttempted) return false;
    refreshAttempted = true;
    try {
      refreshed = await refreshTokens(refreshToken);
      accessToken = refreshed.accessToken;
      return true;
    } catch (error) {
      if (!(error instanceof BackendApiError)) console.error(`[${tag}] refresh`, error);
      return false;
    }
  };

  if (!accessToken || isAccessTokenExpiring(accessToken)) {
    const ok = await refresh();
    if (!ok && !accessToken) return sessionExpiredResponse();
  }

  const run = async (): Promise<NextResponse> => {
    try {
      return await handler(accessToken as string);
    } catch (error) {
      if (error instanceof BackendApiError && error.status === 401) {
        if (await refresh()) return run();
        return sessionExpiredResponse();
      }
      return bffErrorResponse(error, fallbackMessage, tag);
    }
  };

  const response = await run();
  // A handler that ended the session (logout, password change...) already cleared
  // the cookies: never resurrect them with the refreshed tokens.
  const handlerSetAuthCookies = response.cookies.has(AUTH_COOKIE.accessToken);
  if (refreshed && response.status !== 401 && !handlerSetAuthCookies) {
    applyAuthCookies(response, refreshed);
  }
  return response;
}
