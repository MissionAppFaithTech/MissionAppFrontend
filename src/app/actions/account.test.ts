import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearRefreshCache } from '@/lib/api/bff';
import { AUTH_COOKIE } from '@/lib/auth/cookies';
import {
  ACCESS,
  NEW_TOKENS,
  authCookiesCleared,
  backendError,
  backendMock,
  cacheMock,
  cookieValue,
  cookieWrites,
  mockBackend,
  onlyNewToken,
  resetActionHarness,
} from '@/test/actionHarness';
import { changePasswordAction, registerAccountAction, updateAccountProfileAction } from './account';

vi.mock('next/headers', async () => (await import('@/test/actionHarness')).headersMock);
vi.mock('next/cache', async () => (await import('@/test/actionHarness')).cacheMock);
vi.mock('@/lib/api/backend', async () => (await import('@/test/actionHarness')).backendMock);

beforeEach(() => {
  clearRefreshCache();
  resetActionHarness();
});

describe('registerAccountAction', () => {
  const input = {
    fullName: 'Ana Souza',
    username: 'ana_souza',
    phoneNumber: '+5521987654321',
    gender: 'FEMALE' as const,
    email: 'ana@example.com',
    password: 'Secret123!',
    passwordConfirmation: 'Secret123!',
  };
  const user = { id: 'usr-9', fullName: 'Ana Souza', email: 'ana@example.com', role: 'SUPPORTER' };

  it('creates the account and logs the user in', async () => {
    mockBackend({
      'POST /accounts': () => ({ data: { user, accessToken: 'acc', refreshToken: 'ref' } }),
    });

    await expect(registerAccountAction(input)).resolves.toEqual({ ok: true, data: { user } });
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/accounts', {
      method: 'POST',
      body: input,
    });
    expect(cookieValue(AUTH_COOKIE.accessToken)).toBe('acc');
  });

  it('rejects a username with a valid prefix followed by invalid characters', async () => {
    await expect(registerAccountAction({ ...input, username: 'ana-souza' })).resolves.toMatchObject(
      { ok: false, status: 422, message: 'Dados de cadastro inválidos' }
    );
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });

  it('rejects mismatched passwords with a clear message', async () => {
    await expect(
      registerAccountAction({ ...input, passwordConfirmation: 'Outra123!' })
    ).resolves.toEqual({ ok: false, status: 422, message: 'As senhas não coincidem' });
  });

  it('maps a taken e-mail and sets no cookie', async () => {
    mockBackend({
      'POST /accounts': () => {
        throw backendError(422, {
          message: 'Validation failure',
          code: 'E_VALIDATION_ERROR',
          errors: [{ field: 'email', rule: 'database.unique', message: 'taken' }],
        });
      },
    });

    const result = await registerAccountAction(input);

    expect(result).toMatchObject({ ok: false, status: 422 });
    expect(result.ok === false && result.fieldErrors).toHaveProperty('email');
    expect(cookieWrites).toEqual([]);
  });
});

describe('changePasswordAction', () => {
  const input = {
    currentPassword: 'Velha123!',
    newPassword: 'Nova1234!',
    newPasswordConfirmation: 'Nova1234!',
  };

  it('changes the password and clears the cookies, since every session ends', async () => {
    mockBackend({ 'PATCH /account/password': () => null });

    await expect(changePasswordAction(input)).resolves.toEqual({
      ok: true,
      data: { reauthenticationRequired: true },
    });
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/account/password', {
      method: 'PATCH',
      body: input,
      accessToken: ACCESS,
    });
    expect(authCookiesCleared()).toBe(true);
  });

  it('never stores refreshed tokens over the cleared session', async () => {
    mockBackend({
      'POST /auth/refresh': () => ({ data: NEW_TOKENS }),
      'PATCH /account/password': onlyNewToken(null),
    });

    await expect(changePasswordAction(input)).resolves.toMatchObject({ ok: true });
    expect(cookieValue(AUTH_COOKIE.accessToken)).toBeUndefined();
    expect(cookieValue(AUTH_COOKIE.refreshToken)).toBeUndefined();
  });

  it('validates the new password and its confirmation', async () => {
    const result = await changePasswordAction({
      ...input,
      newPassword: 'curta',
      newPasswordConfirmation: 'outra',
    });

    expect(result).toMatchObject({
      ok: false,
      status: 422,
      fieldErrors: { newPassword: 'A nova senha deve ter pelo menos 8 caracteres' },
    });
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });

  it('keeps the session when the current password is wrong', async () => {
    mockBackend({
      'PATCH /account/password': () => {
        throw backendError(400, {
          message: 'Invalid user credentials',
          code: 'E_INVALID_CREDENTIALS',
        });
      },
    });

    await expect(changePasswordAction(input)).resolves.toMatchObject({ ok: false, status: 400 });
    expect(cookieWrites).toEqual([]);
  });
});

describe('updateAccountProfileAction', () => {
  const saved = (username: string) => ({
    data: { user: { id: 'usr-1', fullName: 'Ana', username, biography: null } },
  });

  it('saves, expires the public profile and re-renders the page', async () => {
    mockBackend({ 'PATCH /account/profile': () => saved('ana') });

    const result = await updateAccountProfileAction({ fullName: ' Ana ', biography: null });

    expect(result).toEqual({ ok: true, data: saved('ana').data });
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/account/profile', {
      method: 'PATCH',
      body: { fullName: 'Ana', biography: null },
      accessToken: ACCESS,
    });
    expect(cacheMock.updateTag).toHaveBeenCalledWith('profile:ana');
    expect(cacheMock.refresh).toHaveBeenCalledTimes(1);
  });

  it('expires the old username too when the username changes', async () => {
    mockBackend({
      'GET /account/profile': () => saved('ana_old'),
      'PATCH /account/profile': () => saved('ana_new'),
    });

    await updateAccountProfileAction({ username: 'ana_new' });

    expect(cacheMock.updateTag.mock.calls).toEqual([['profile:ana_old'], ['profile:ana_new']]);
  });

  it('rejects an invalid username without touching the cache', async () => {
    const result = await updateAccountProfileAction({ username: 'Ana Souza' });

    expect(result).toMatchObject({ ok: false, status: 422, message: 'Dados de perfil inválidos' });
    expect(cacheMock.updateTag).not.toHaveBeenCalled();
    expect(cacheMock.refresh).not.toHaveBeenCalled();
  });

  it('reports a taken username and keeps the cache', async () => {
    mockBackend({
      'GET /account/profile': () => saved('ana'),
      'PATCH /account/profile': () => {
        throw backendError(422, {
          message: 'Validation failure',
          code: 'E_VALIDATION_ERROR',
          errors: [{ field: 'username', rule: 'database.unique', message: 'taken' }],
        });
      },
    });

    const result = await updateAccountProfileAction({ username: 'usado' });

    expect(result).toMatchObject({ ok: false, status: 422 });
    expect(result.ok === false && result.fieldErrors).toHaveProperty('username');
    expect(cacheMock.refresh).not.toHaveBeenCalled();
  });
});
