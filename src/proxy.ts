import { NextResponse, type NextRequest } from 'next/server';
import { BackendApiError } from '@/lib/api/backend';
import { refreshTokens } from '@/lib/api/bff';
import { clientHeadersFrom } from '@/lib/api/clientIp';
import { getBackendOrigin } from '@/lib/api/config';
import { AUTH_COOKIE, applyAuthCookies, clearAuthCookies } from '@/lib/auth/cookies';
import { deviceHeaders, readDeviceId } from '@/lib/auth/device';
import { decodeAccessToken, isAccessTokenExpiring } from '@/lib/auth/jwt';
import { accessAreaFor, accessDecision } from '@/lib/auth/rbac';
import type { BackendRole } from '@/types/backend';

const ROLES = new Set<BackendRole>(['ADMIN', 'MISSIONARY', 'SUPPORTER']);

type AuthTokens = { accessToken: string; refreshToken: string };

/** What the proxy did to the session before rendering. */
type SessionRefresh =
  | { kind: 'unchanged' }
  | { kind: 'refreshed'; tokens: AuthTokens }
  /** The backend refused the refresh token: the session is over. */
  | { kind: 'ended' };

function roleFromAccessToken(token: string | undefined): BackendRole | null {
  const role = token ? decodeAccessToken(token)?.role : undefined;
  return role && ROLES.has(role as BackendRole) ? (role as BackendRole) : null;
}

/** One warning per minute while the API is down, instead of a stack trace per request. */
export const UNREACHABLE_LOG_INTERVAL_MS = 60_000;
let lastUnreachableLog = 0;

/** Tests only: lets the next failure log again. */
export function resetUnreachableLog() {
  lastUnreachableLog = 0;
}

function warnApiUnreachable(error: unknown) {
  const now = Date.now();
  if (now - lastUnreachableLog < UNREACHABLE_LOG_INTERVAL_MS) return;
  lastUnreachableLog = now;

  const cause = error instanceof Error ? error.cause : undefined;
  const reason =
    error instanceof BackendApiError
      ? `HTTP ${error.status}`
      : ((cause as { code?: string } | undefined)?.code ??
        (error instanceof Error ? error.message : String(error)));
  console.warn(
    `[proxy] API ${getBackendOrigin()} não respondeu ao renovar a sessão (${reason}). ` +
      'Os cookies foram mantidos; o próximo pedido tenta de novo.'
  );
}

/**
 * Server Components cannot write cookies, so the session is renewed here, before
 * any page, Server Action or route handler runs (ADR-0006). Being the single place
 * that refreshes also keeps two callers from spending the same refresh token,
 * which the backend treats as theft (ADR-0023 do backend).
 */
async function refreshSession(request: NextRequest): Promise<SessionRefresh> {
  const accessToken = request.cookies.get(AUTH_COOKIE.accessToken)?.value;
  const refreshToken = request.cookies.get(AUTH_COOKIE.refreshToken)?.value;
  if (!refreshToken) return { kind: 'unchanged' };
  if (accessToken && !isAccessTokenExpiring(accessToken)) return { kind: 'unchanged' };

  try {
    const tokens = await refreshTokens(refreshToken, {
      ...clientHeadersFrom(request.headers),
      ...deviceHeaders(request.headers, readDeviceId(request.cookies)),
    });
    return { kind: 'refreshed', tokens };
  } catch (error) {
    if (error instanceof BackendApiError && (error.status === 401 || error.status === 403)) {
      return { kind: 'ended' };
    }
    // Network or 5xx: keep the cookies; the next request tries again.
    warnApiUnreachable(error);
    return { kind: 'unchanged' };
  }
}

/** Rewrites the request cookies so the downstream render reads the new session. */
function forwardSession(request: NextRequest, refresh: SessionRefresh) {
  if (refresh.kind === 'refreshed') {
    request.cookies.set(AUTH_COOKIE.accessToken, refresh.tokens.accessToken);
    request.cookies.set(AUTH_COOKIE.refreshToken, refresh.tokens.refreshToken);
  } else if (refresh.kind === 'ended') {
    request.cookies.delete(AUTH_COOKIE.accessToken);
    request.cookies.delete(AUTH_COOKIE.refreshToken);
  }
}

function withSessionCookies(response: NextResponse, refresh: SessionRefresh) {
  if (refresh.kind === 'refreshed') applyAuthCookies(response, refresh.tokens);
  else if (refresh.kind === 'ended') clearAuthCookies(response);
  return response;
}

/**
 * 1. Renews an expiring session (see {@link refreshSession}).
 * 2. Optimistic RBAC (see `lib/auth/rbac.ts`): logged-out visitors go to login and
 *    a role outside its area goes to its own home. The role comes from the access
 *    token without verifying it — only to pick the screen; the BFF and the backend
 *    still authorize every request. When a session exists but the role cannot be
 *    read (an unreadable token), the page loads and its client guard decides.
 */
export async function proxy(request: NextRequest) {
  const refresh = await refreshSession(request);
  forwardSession(request, refresh);

  const next = () =>
    withSessionCookies(NextResponse.next({ request: { headers: request.headers } }), refresh);

  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith('/api/') || accessAreaFor(pathname) === 'public') return next();

  const accessToken = request.cookies.get(AUTH_COOKIE.accessToken)?.value;
  const role = roleFromAccessToken(accessToken);
  const hasSession = Boolean(accessToken) || request.cookies.has(AUTH_COOKIE.refreshToken);
  if (!role && hasSession) return next();

  const decision = accessDecision(role, pathname, search);
  if (decision.allow) return next();
  return withSessionCookies(
    NextResponse.redirect(new URL(decision.redirectTo, request.url)),
    refresh
  );
}

export const config = {
  // Every page, Server Action and BFF route; static files and images are skipped.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|llms.txt|llms-full.txt|.*\\.(?:png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|mp4|webm|pdf)$).*)',
  ],
};
