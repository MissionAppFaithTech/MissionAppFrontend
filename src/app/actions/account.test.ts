import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearRefreshCache } from '@/lib/api/bff';
import { AUTH_COOKIE } from '@/lib/auth/cookies';
import { DEVICE_COOKIE } from '@/lib/auth/device';
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
import {
  changePasswordAction,
  registerAccountAction,
  registerMissionaryAction,
  updateAccountProfileAction,
} from './account';

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
    const deviceId = cookieValue(DEVICE_COOKIE);
    expect(deviceId).toMatch(/^[\w-]{16,128}$/);
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/accounts', {
      method: 'POST',
      body: input,
      headers: { 'x-device-id': deviceId, 'x-device-kind': 'unknown' },
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

describe('registerMissionaryAction', () => {
  const AGENCY_ID = '019a0000-0000-7000-8000-00000000a001';
  const COMMUNITY_ID = '019a0000-0000-7000-8000-00000000c001';
  const input = {
    fullName: 'João Missionário',
    username: 'joao_missao',
    phoneNumber: '+5511999999999',
    gender: 'MALE' as const,
    email: 'joao@example.com',
    password: 'Secret123!',
    passwordConfirmation: 'Secret123!',
    birthDate: '1990-12-25',
    identityType: 'CPF' as const,
    identityDocument: '52998224725',
    aboutMe: 'Evangelismo no interior',
    missionaryAgencyId: AGENCY_ID,
    faithCommunityId: COMMUNITY_ID,
  };
  const user = { id: 'usr-7', fullName: 'João', email: 'joao@example.com', role: 'MISSIONARY' };
  const profile = {
    missionary: { id: 'mis-7', missionaryAgencyId: AGENCY_ID },
    workAddress: null,
    missionaryAgency: { id: AGENCY_ID, name: 'JOCUM' },
    faithCommunity: { id: COMMUNITY_ID, name: 'Igreja Batista Central' },
  };

  it('signs up in one request and keeps the MISSIONARY session it returns', async () => {
    mockBackend({
      'POST /accounts/missionaries': () => ({
        data: { user, ...profile, accessToken: 'acc-m', refreshToken: 'ref-m' },
      }),
    });

    await expect(registerMissionaryAction(input)).resolves.toEqual({
      ok: true,
      data: { user, ...profile },
    });
    const deviceId = cookieValue(DEVICE_COOKIE);
    expect(backendMock.backendFetch).toHaveBeenCalledTimes(1);
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/accounts/missionaries', {
      method: 'POST',
      body: input,
      headers: { 'x-device-id': deviceId, 'x-device-kind': 'unknown' },
    });
    expect(cookieValue(AUTH_COOKIE.accessToken)).toBe('acc-m');
    expect(cookieValue(AUTH_COOKIE.refreshToken)).toBe('ref-m');
  });

  it('sends a new agency and community (with the pastor) instead of ids', async () => {
    mockBackend({
      'POST /accounts/missionaries': () => ({
        data: { user, ...profile, accessToken: 'a', refreshToken: 'r' },
      }),
    });
    const { missionaryAgencyId: _a, faithCommunityId: _c, ...rest } = input;

    await registerMissionaryAction({
      ...rest,
      missionaryAgency: { name: ' Nova Agência ', city: 'Recife' },
      faithCommunity: { name: 'Nova Igreja', pastorName: 'Pr. Ana', pastorPhone: '+5521912345678' },
    });

    expect(backendMock.backendFetch.mock.calls[0][1].body).toMatchObject({
      missionaryAgency: { name: 'Nova Agência', city: 'Recife' },
      faithCommunity: { name: 'Nova Igreja', pastorName: 'Pr. Ana', pastorPhone: '+5521912345678' },
    });
  });

  it.each([
    ['no agency', { missionaryAgencyId: undefined }, 'missionaryAgencyId'],
    [
      'an agency id and a new agency',
      { missionaryAgency: { name: 'Outra' } },
      'missionaryAgencyId',
    ],
    [
      'a community id and a new community',
      { faithCommunity: { name: 'Outra' } },
      'faithCommunityId',
    ],
    ['a document without its type', { identityType: undefined }, 'identityDocument'],
    ['a birth date outside YYYY-MM-DD', { birthDate: '25/12/1990' }, 'birthDate'],
    [
      'a pastor phone without the name',
      {
        faithCommunityId: undefined,
        faithCommunity: { name: 'Igreja', pastorPhone: '+5521912345678' },
      },
      'faithCommunity',
    ],
  ])('rejects %s before calling the API', async (_case, override, field) => {
    const result = await registerMissionaryAction({ ...input, ...override });

    expect(result).toMatchObject({
      ok: false,
      status: 422,
      message: 'Dados de cadastro inválidos',
    });
    expect(result.ok === false && result.fieldErrors).toHaveProperty(field);
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });

  it('rejects mismatched passwords', async () => {
    await expect(
      registerMissionaryAction({ ...input, passwordConfirmation: 'Outra123!' })
    ).resolves.toEqual({ ok: false, status: 422, message: 'As senhas não coincidem' });
  });

  it('maps the field errors of the transaction and sets no cookie', async () => {
    mockBackend({
      'POST /accounts/missionaries': () => {
        throw backendError(422, {
          message: 'Validation failure',
          code: 'E_VALIDATION_ERROR',
          errors: [
            { field: 'email', rule: 'database.unique', message: 'taken' },
            { field: 'missionaryAgency.name', rule: 'required', message: 'required' },
          ],
        });
      },
    });

    const result = await registerMissionaryAction(input);

    expect(result).toMatchObject({
      ok: false,
      status: 422,
      fieldErrors: {
        email: 'Este e-mail já está em uso.',
        'missionaryAgency.name': 'Campo obrigatório.',
      },
    });
    expect(cookieWrites).toEqual([]);
  });

  it('explains the sign-up rate limit in Portuguese', async () => {
    mockBackend({
      'POST /accounts/missionaries': () => {
        throw backendError(429, { message: 'Too many requests', code: 'E_TOO_MANY_REQUESTS' });
      },
    });

    const result = await registerMissionaryAction(input);

    expect(result).toMatchObject({ ok: false, status: 429 });
    expect(result.ok === false && result.message).toMatch(/muitas tentativas/i);
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

  it('links a confirmed profile picture, or removes it with null', async () => {
    const PICTURE_ID = '019a0000-0000-7000-8000-0000000000f1';
    mockBackend({ 'PATCH /account/profile': () => saved('ana') });

    await expect(
      updateAccountProfileAction({ profilePictureId: PICTURE_ID })
    ).resolves.toMatchObject({ ok: true });
    await updateAccountProfileAction({ profilePictureId: null });

    expect(backendMock.backendFetch.mock.calls.map(([, options]) => options.body)).toEqual([
      { profilePictureId: PICTURE_ID },
      { profilePictureId: null },
    ]);
    expect(cacheMock.updateTag).toHaveBeenCalledWith('profile:ana');
  });

  it('rejects a profile picture id that is not a UUID', async () => {
    await expect(updateAccountProfileAction({ profilePictureId: 'foto' })).resolves.toMatchObject({
      ok: false,
      status: 422,
      fieldErrors: { profilePictureId: expect.any(String) },
    });
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
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
