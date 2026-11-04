import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearRefreshCache } from '@/lib/api/bff';
import { AUTH_COOKIE } from '@/lib/auth/cookies';
import { DEVICE_COOKIE, deviceCookieMaxAge } from '@/lib/auth/device';
import {
  ACCESS,
  NEW_TOKENS,
  authCookiesCleared,
  backendError,
  backendMock,
  cookieValue,
  cookieWrites,
  headersMock,
  jwt,
  mockBackend,
  onlyNewToken,
  resetActionHarness,
  setCookie,
  setSession,
} from '@/test/actionHarness';
import {
  endAllSessionsAction,
  endSessionAction,
  loginAction,
  logoutAction,
  requestPasswordResetAction,
  resetPasswordAction,
} from './auth';

vi.mock('next/headers', async () => (await import('@/test/actionHarness')).headersMock);
vi.mock('@/lib/api/backend', async () => (await import('@/test/actionHarness')).backendMock);

const user = { id: 'usr-1', fullName: 'Ana', email: 'ana@example.com', role: 'MISSIONARY' };
const KNOWN_DEVICE_ID = '0b8e5d4c-3a2f-4e1d-8c7b-6a5f4e3d2c1b';
const SESSION_ID = '019a1b2c-3d4e-7f50-8a6b-7c8d9e0f1a2b';

beforeEach(() => {
  clearRefreshCache();
  resetActionHarness();
});

describe('loginAction', () => {
  it('logs in, stores the tokens in httpOnly cookies and returns only the user', async () => {
    setSession();
    mockBackend({
      'POST /auth/login': () => ({
        data: { user, accessToken: 'acc', refreshToken: 'ref' },
      }),
    });

    const result = await loginAction({ login: 'ana@example.com', password: 'Secret123!' });

    expect(result).toEqual({ ok: true, data: { user } });
    const deviceId = cookieValue(DEVICE_COOKIE);
    expect(deviceId).toMatch(/^[\w-]{16,128}$/);
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { login: 'ana@example.com', password: 'Secret123!' },
      headers: { 'x-device-id': deviceId, 'x-device-kind': 'unknown' },
    });
    expect(cookieValue(AUTH_COOKIE.accessToken)).toBe('acc');
    expect(cookieValue(AUTH_COOKIE.refreshToken)).toBe('ref');
    expect(cookieWrites.find((write) => write.name === DEVICE_COOKIE)?.maxAge).toBe(
      deviceCookieMaxAge
    );
  });

  it('reuses the device id of earlier logins so the API replaces that session (ADR-0007)', async () => {
    setSession();
    setCookie(DEVICE_COOKIE, KNOWN_DEVICE_ID);
    headersMock.headers.mockResolvedValueOnce(
      new Headers({
        'user-agent':
          'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
      })
    );
    mockBackend({
      'POST /auth/login': () => ({ data: { user, accessToken: 'acc', refreshToken: 'ref' } }),
    });

    await loginAction({ login: 'ana@example.com', password: 'Secret123!' });

    expect(backendMock.backendFetch).toHaveBeenCalledWith(
      '/auth/login',
      expect.objectContaining({
        headers: {
          'x-device-id': KNOWN_DEVICE_ID,
          'x-device-kind': 'mobile',
          'x-device-name': 'Chrome no Android',
        },
      })
    );
    expect(cookieValue(DEVICE_COOKIE)).toBe(KNOWN_DEVICE_ID);
  });

  it('replaces a device cookie the API would refuse', async () => {
    setSession();
    setCookie(DEVICE_COOKIE, 'curto');
    mockBackend({
      'POST /auth/login': () => ({ data: { user, accessToken: 'acc', refreshToken: 'ref' } }),
    });

    await loginAction({ login: 'ana@example.com', password: 'Secret123!' });

    expect(cookieValue(DEVICE_COOKIE)).not.toBe('curto');
    expect(cookieValue(DEVICE_COOKIE)).toMatch(/^[\w-]{16,128}$/);
  });

  it('rejects an invalid e-mail without calling the backend', async () => {
    const result = await loginAction({ login: 'not-an-email', password: 'x' });

    expect(result).toMatchObject({ ok: false, status: 422, message: 'Dados de login inválidos' });
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });

  it('maps wrong credentials to pt-BR and sets no cookie', async () => {
    setSession();
    mockBackend({
      'POST /auth/login': () => {
        throw backendError(400, {
          message: 'Invalid user credentials',
          code: 'E_INVALID_CREDENTIALS',
        });
      },
    });

    const result = await loginAction({ login: 'ana@example.com', password: 'errada' });

    expect(result).toMatchObject({ ok: false, status: 400, code: 'E_INVALID_CREDENTIALS' });
    expect(result.ok === false && result.message).not.toBe('Invalid user credentials');
    expect(cookieWrites).toEqual([]);
  });

  it('answers 502 with the fallback when the backend is unreachable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    backendMock.backendFetch.mockRejectedValue(new TypeError('fetch failed'));

    await expect(
      loginAction({ login: 'ana@example.com', password: 'Secret123!' })
    ).resolves.toEqual({
      ok: false,
      status: 502,
      message: 'Não foi possível conectar ao servidor de autenticação',
    });
    vi.mocked(console.error).mockRestore();
  });
});

describe('logoutAction', () => {
  it('revokes the session with the refresh token and clears the cookies', async () => {
    mockBackend({ 'DELETE /auth/logout': () => null });

    await expect(logoutAction()).resolves.toEqual({
      ok: true,
      data: { message: 'Você saiu da sua conta.' },
    });
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/auth/logout', {
      method: 'DELETE',
      body: { refreshToken: 'rt-1' },
      accessToken: ACCESS,
    });
    expect(authCookiesCleared()).toBe(true);
  });

  it('keeps the device cookie: it names the browser, not the session (ADR-0007)', async () => {
    setCookie(DEVICE_COOKIE, KNOWN_DEVICE_ID);
    mockBackend({ 'DELETE /auth/logout': () => null });

    await logoutAction();

    expect(cookieValue(DEVICE_COOKIE)).toBe(KNOWN_DEVICE_ID);
    expect(cookieWrites.some((write) => write.name === DEVICE_COOKIE)).toBe(false);
  });

  it('does not send an expired bearer', async () => {
    setSession(jwt({ sub: 'usr-1', exp: Math.floor(Date.now() / 1000) - 10 }), 'rt-1');
    mockBackend({ 'DELETE /auth/logout': () => null });

    await logoutAction();

    expect(backendMock.backendFetch).toHaveBeenCalledWith(
      '/auth/logout',
      expect.objectContaining({ accessToken: undefined })
    );
  });

  it('still clears the cookies when the backend fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    backendMock.backendFetch.mockRejectedValue(new TypeError('fetch failed'));

    await expect(logoutAction()).resolves.toMatchObject({ ok: true });
    expect(authCookiesCleared()).toBe(true);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('skips the backend without a refresh token', async () => {
    setSession(ACCESS);

    await logoutAction();

    expect(backendMock.backendFetch).not.toHaveBeenCalled();
    expect(authCookiesCleared()).toBe(true);
  });
});

describe('requestPasswordResetAction', () => {
  const SENT =
    'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir a senha.';

  it('asks the backend and returns its message', async () => {
    mockBackend({ 'POST /auth/forgot-password': () => ({ message: 'Enviado.' }) });

    await expect(requestPasswordResetAction({ login: 'ana@example.com' })).resolves.toEqual({
      ok: true,
      data: { message: 'Enviado.' },
    });
  });

  it('uses the generic message when the backend answers without a body', async () => {
    mockBackend({ 'POST /auth/forgot-password': () => null });

    await expect(requestPasswordResetAction({ login: 'ana@example.com' })).resolves.toEqual({
      ok: true,
      data: { message: SENT },
    });
  });

  it('never reveals accounts when the backend is unreachable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    backendMock.backendFetch.mockRejectedValue(new TypeError('fetch failed'));

    await expect(requestPasswordResetAction({ login: 'ana@example.com' })).resolves.toEqual({
      ok: true,
      data: { message: SENT },
    });
    vi.mocked(console.error).mockRestore();
  });

  it('reports backend errors such as the rate limit', async () => {
    mockBackend({
      'POST /auth/forgot-password': () => {
        throw backendError(429, { message: 'Too many requests', code: 'E_TOO_MANY_REQUESTS' });
      },
    });

    await expect(requestPasswordResetAction({ login: 'ana@example.com' })).resolves.toMatchObject({
      ok: false,
      status: 429,
    });
  });

  it('rejects an invalid e-mail', async () => {
    await expect(requestPasswordResetAction({ login: 'x' })).resolves.toMatchObject({
      ok: false,
      status: 422,
      message: 'Informe um e-mail válido',
    });
  });
});

describe('resetPasswordAction', () => {
  const input = { token: 'tok', password: 'NovaSenha1!', passwordConfirmation: 'NovaSenha1!' };

  it('sends the backend field names and returns its message', async () => {
    mockBackend({ 'PATCH /auth/reset-password': () => ({ message: 'Pronto.' }) });

    await expect(resetPasswordAction(input)).resolves.toEqual({
      ok: true,
      data: { message: 'Pronto.' },
    });
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/auth/reset-password', {
      method: 'PATCH',
      body: { token: 'tok', newPassword: 'NovaSenha1!', newPasswordConfirmation: 'NovaSenha1!' },
    });
  });

  it('checks the confirmation before calling the backend', async () => {
    const result = await resetPasswordAction({ ...input, passwordConfirmation: 'Outra1!aa' });

    expect(result).toMatchObject({
      ok: false,
      status: 422,
      fieldErrors: { passwordConfirmation: 'As senhas não coincidem' },
    });
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });

  it('maps backend field errors to the form field names', async () => {
    mockBackend({
      'PATCH /auth/reset-password': () => {
        throw backendError(422, {
          message: 'Validation failure',
          code: 'E_VALIDATION_ERROR',
          errors: [
            { field: 'newPassword', rule: 'minLength', message: 'too short' },
            { field: 'token', rule: 'required', message: 'required' },
          ],
        });
      },
    });

    const result = await resetPasswordAction(input);

    expect(result).toMatchObject({ ok: false, status: 422 });
    expect(Object.keys(result.ok === false ? (result.fieldErrors ?? {}) : {})).toEqual([
      'password',
      'token',
    ]);
  });

  it('maps an invalid token error', async () => {
    mockBackend({
      'PATCH /auth/reset-password': () => {
        throw backendError(400, { message: 'Invalid token', code: 'E_INVALID_TOKEN' });
      },
    });

    await expect(resetPasswordAction(input)).resolves.toMatchObject({ ok: false, status: 400 });
  });
});

describe('endSessionAction', () => {
  it("ends another device's session and keeps this one", async () => {
    mockBackend({ [`DELETE /auth/sessions/${SESSION_ID}`]: () => ({ message: 'ok' }) });

    await expect(endSessionAction(SESSION_ID)).resolves.toEqual({
      ok: true,
      data: { message: 'Sessão encerrada.' },
    });
    expect(backendMock.backendFetch).toHaveBeenCalledWith(`/auth/sessions/${SESSION_ID}`, {
      method: 'DELETE',
      accessToken: ACCESS,
    });
    expect(cookieWrites).toEqual([]);
  });

  it('rejects an id that is not a session id without calling the backend', async () => {
    await expect(endSessionAction('../auth/sessions')).resolves.toMatchObject({
      ok: false,
      status: 422,
      message: 'Sessão inválida',
    });
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });

  it('maps a session that no longer exists', async () => {
    mockBackend({
      [`DELETE /auth/sessions/${SESSION_ID}`]: () => {
        throw backendError(404, { message: 'Session not found', code: 'E_SESSION_NOT_FOUND' });
      },
    });

    await expect(endSessionAction(SESSION_ID)).resolves.toMatchObject({
      ok: false,
      status: 404,
      code: 'E_SESSION_NOT_FOUND',
    });
  });

  it('answers 401 without a session', async () => {
    setSession();

    await expect(endSessionAction(SESSION_ID)).resolves.toMatchObject({ ok: false, status: 401 });
  });
});

describe('endAllSessionsAction', () => {
  it('ends every session on the backend and clears the auth cookies', async () => {
    mockBackend({ 'DELETE /auth/sessions': () => null });

    await expect(endAllSessionsAction()).resolves.toEqual({
      ok: true,
      data: { message: 'Todas as sessões foram encerradas.' },
    });
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/auth/sessions', {
      method: 'DELETE',
      accessToken: ACCESS,
    });
    expect(authCookiesCleared()).toBe(true);
  });

  it('never stores refreshed tokens over the cleared session', async () => {
    mockBackend({
      'POST /auth/refresh': () => ({ data: NEW_TOKENS }),
      'DELETE /auth/sessions': onlyNewToken(null),
    });

    await expect(endAllSessionsAction()).resolves.toMatchObject({ ok: true });
    expect(cookieValue(AUTH_COOKIE.accessToken)).toBeUndefined();
    expect(cookieValue(AUTH_COOKIE.refreshToken)).toBeUndefined();
  });

  it('keeps the cookies when the backend fails', async () => {
    mockBackend({
      'DELETE /auth/sessions': () => {
        throw backendError(500, { message: 'boom' });
      },
    });

    await expect(endAllSessionsAction()).resolves.toMatchObject({ ok: false, status: 500 });
    expect(cookieWrites).toEqual([]);
  });

  it('answers 401 without a session', async () => {
    setSession();

    await expect(endAllSessionsAction()).resolves.toMatchObject({ ok: false, status: 401 });
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });
});
