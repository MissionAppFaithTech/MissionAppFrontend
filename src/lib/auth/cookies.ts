import type { NextResponse } from 'next/server';

export const AUTH_COOKIE = {
  accessToken: 'ma_access_token',
  refreshToken: 'ma_refresh_token',
} as const;

const isProd = process.env.NODE_ENV === 'production';

export const authCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
};

/** Access JWT ~15min no backend; cookie um pouco acima. */
export const accessTokenCookieMaxAge = 60 * 20;
/** Refresh web padrão ~7d (ADR-0023). */
export const refreshTokenCookieMaxAge = 60 * 60 * 24 * 7;

/**
 * Anything that can set a cookie: `NextResponse.cookies` in route handlers and
 * the proxy, or the `cookies()` store inside a Server Action (ADR-0006).
 */
export type CookieWriter = {
  set(name: string, value: string, options: typeof authCookieOptions & { maxAge: number }): unknown;
};

export function setAuthCookies(
  jar: CookieWriter,
  tokens: { accessToken: string; refreshToken: string }
) {
  jar.set(AUTH_COOKIE.accessToken, tokens.accessToken, {
    ...authCookieOptions,
    maxAge: accessTokenCookieMaxAge,
  });
  jar.set(AUTH_COOKIE.refreshToken, tokens.refreshToken, {
    ...authCookieOptions,
    maxAge: refreshTokenCookieMaxAge,
  });
}

export function expireAuthCookies(jar: CookieWriter) {
  jar.set(AUTH_COOKIE.accessToken, '', { ...authCookieOptions, maxAge: 0 });
  jar.set(AUTH_COOKIE.refreshToken, '', { ...authCookieOptions, maxAge: 0 });
}

export function applyAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string }
) {
  setAuthCookies(response.cookies, tokens);
}

export function clearAuthCookies(response: NextResponse) {
  expireAuthCookies(response.cookies);
}
