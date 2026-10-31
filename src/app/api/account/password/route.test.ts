import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATCH } from './route';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { AUTH_COOKIE } from '@/lib/auth/cookies';
import { clearRefreshCache } from '@/lib/api/bff';

const cookieJar = new Map<string, string>();
const mockCookieStore = {
  get: vi.fn((name: string) => {
    const value = cookieJar.get(name);
    return value === undefined ? undefined : { name, value };
  }),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

vi.mock('@/lib/api/backend', () => ({
  backendFetch: vi.fn(),
  BackendApiError: class BackendApiError extends Error {
    constructor(
      message: string,
      public status: number,
      public body?: unknown
    ) {
      super(message);
      this.name = 'BackendApiError';
    }
  },
}));

const b64url = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
const jwt = (claims: Record<string, unknown>) =>
  `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(claims)}.sig`;
const ACCESS = jwt({ sub: 'usr-1', role: 'MISSIONARY', exp: Math.floor(Date.now() / 1000) + 900 });
const NEW_TOKENS = { accessToken: 'new-access', refreshToken: 'new-refresh' };
const SESSION_EXPIRED = 'Sua sessão expirou. Entre novamente para continuar.';

function setSession(accessToken?: string, refreshToken?: string) {
  cookieJar.clear();
  if (accessToken) cookieJar.set(AUTH_COOKIE.accessToken, accessToken);
  if (refreshToken) cookieJar.set(AUTH_COOKIE.refreshToken, refreshToken);
}

type FetchOptions = { method?: string; body?: unknown; accessToken?: string };
type RouteHandler = (options: FetchOptions) => unknown;

/** Routes mocked backend calls by `"<METHOD> <path>"`; unknown routes fail the test. */
function mockBackend(routes: Record<string, RouteHandler>) {
  vi.mocked(backendFetch).mockImplementation(async (path: string, options: FetchOptions = {}) => {
    const handler = routes[`${options.method ?? 'GET'} ${path}`];
    if (!handler) throw new Error(`Unexpected backend call: ${options.method ?? 'GET'} ${path}`);
    return handler(options);
  });
}

const unauthorized = () => new BackendApiError('Erro na API (401)', 401, 'Unauthorized access');
const refreshOk = () => ({ data: NEW_TOKENS });
/** Rejects the original token with the backend's plain-text 401, accepts the refreshed one. */
const onlyNewToken =
  (result: unknown): RouteHandler =>
  ({ accessToken }) => {
    if (accessToken !== NEW_TOKENS.accessToken) throw unauthorized();
    return result;
  };

function expectCookiesCleared(response: Response) {
  const setCookie = response.headers.getSetCookie();
  expect(setCookie).toEqual(
    expect.arrayContaining([
      expect.stringMatching(/^ma_access_token=;.*Max-Age=0/),
      expect.stringMatching(/^ma_refresh_token=;.*Max-Age=0/),
    ])
  );
}

const patch = (body: unknown) =>
  PATCH(
    new Request('http://localhost:3000/api/account/password', {
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  );

const valid = {
  currentPassword: 'OldPassword123!',
  newPassword: 'NewPassword123!',
  newPasswordConfirmation: 'NewPassword123!',
};

beforeEach(() => {
  clearRefreshCache();
  vi.mocked(backendFetch).mockReset();
  mockCookieStore.get.mockClear();
  setSession(ACCESS, 'rt-1');
});

describe('PATCH /api/account/password', () => {
  it('changes the password, asks for re-authentication and clears the cookies', async () => {
    mockBackend({ 'PATCH /account/password': () => ({ message: 'Password updated' }) });

    const res = await patch(valid);

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      message: 'Senha alterada. Entre novamente com a nova senha.',
      data: { reauthenticationRequired: true },
    });
    expect(backendFetch).toHaveBeenCalledWith('/account/password', {
      method: 'PATCH',
      accessToken: ACCESS,
      body: valid,
    });
    expectCookiesCleared(res);
    expect(res.headers.getSetCookie().join('\n')).not.toMatch(/Max-Age=(1200|604800)/);
  });

  it('answers 422 on the confirmation field when the passwords do not match', async () => {
    const res = await patch({ ...valid, newPasswordConfirmation: 'Mismatch123!' });

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      message: 'Dados de senha inválidos',
      fieldErrors: { newPasswordConfirmation: 'As senhas não coincidem' },
    });
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it.each([
    ['short', 'Ab1!', 'A nova senha deve ter pelo menos 8 caracteres'],
    ['long', 'A'.repeat(33), 'A nova senha deve ter no máximo 32 caracteres'],
  ])('answers 422 for a too %s new password', async (_label, newPassword, message) => {
    const res = await patch({ ...valid, newPassword, newPasswordConfirmation: newPassword });

    expect(res.status).toBe(422);
    expect((await res.json()).fieldErrors.newPassword).toBe(message);
  });

  it('answers 422 when the current password is empty', async () => {
    const res = await patch({ ...valid, currentPassword: '' });

    expect(res.status).toBe(422);
    expect((await res.json()).fieldErrors).toEqual({ currentPassword: 'Informe a senha atual' });
  });

  it('answers 400 for invalid JSON', async () => {
    const res = await patch('invalid-json');

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: 'JSON inválido' });
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('localizes a wrong current password and keeps the session cookies', async () => {
    mockBackend({
      'PATCH /account/password': () => {
        throw new BackendApiError('The current password is incorrect', 400, {
          message: 'The current password is incorrect',
        });
      },
    });

    const res = await patch(valid);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: 'A senha atual está incorreta.' });
    expect(res.headers.getSetCookie()).toEqual([]);
  });

  it('maps Vine 422 errors to localized fieldErrors', async () => {
    mockBackend({
      'PATCH /account/password': () => {
        throw new BackendApiError('Validation failure', 422, {
          errors: [{ field: 'newPassword', message: 'min', rule: 'minLength', meta: { min: 8 } }],
        });
      },
    });

    const res = await patch(valid);

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      message: 'Use pelo menos 8 caracteres.',
      fieldErrors: { newPassword: 'Use pelo menos 8 caracteres.' },
    });
  });

  it('answers 401 and clears cookies without a session', async () => {
    setSession();

    const res = await patch(valid);

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: SESSION_EXPIRED });
    expectCookiesCleared(res);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('answers 401 and clears cookies when the refresh after a 401 fails', async () => {
    mockBackend({
      'POST /auth/refresh': () => {
        throw unauthorized();
      },
      'PATCH /account/password': () => {
        throw unauthorized();
      },
    });

    const res = await patch(valid);

    expect(res.status).toBe(401);
    expectCookiesCleared(res);
  });

  it('retries with the refreshed token after a backend 401', async () => {
    mockBackend({
      'POST /auth/refresh': refreshOk,
      'PATCH /account/password': onlyNewToken({ message: 'ok' }),
    });

    const res = await patch(valid);

    expect(res.status).toBe(200);
    expect(backendFetch).toHaveBeenLastCalledWith('/account/password', {
      method: 'PATCH',
      accessToken: 'new-access',
      body: valid,
    });
  });
});
