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
import {
  createMissionaryProfileAction,
  updateAboutAction,
  updateIdentityAction,
  updatePublicContactsAction,
  updateWorkAddressAction,
} from './missionary';

vi.mock('next/headers', async () => (await import('@/test/actionHarness')).headersMock);
vi.mock('next/cache', async () => (await import('@/test/actionHarness')).cacheMock);
vi.mock('@/lib/api/backend', async () => (await import('@/test/actionHarness')).backendMock);

const AGENCY_ID = '018f0000-0000-7000-8000-00000000a6e1';
const missionary = { id: 'mis-1', aboutMe: 'Sirvo no sertão' };
const owner = () => ({ data: { user: { username: 'ana' } } });

beforeEach(() => {
  clearRefreshCache();
  resetActionHarness();
});

describe('createMissionaryProfileAction', () => {
  it('creates the profile and clears the cookies, since the backend ends every session', async () => {
    mockBackend({ 'POST /missionaries/profile': () => ({ data: { missionary } }) });

    await expect(createMissionaryProfileAction({ missionaryAgencyId: AGENCY_ID })).resolves.toEqual(
      {
        ok: true,
        data: { missionary, reauthenticationRequired: true },
      }
    );
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/missionaries/profile', {
      method: 'POST',
      body: { missionaryAgencyId: AGENCY_ID },
      accessToken: ACCESS,
    });
    expect(authCookiesCleared()).toBe(true);
  });

  it('never stores refreshed tokens over the cleared session', async () => {
    mockBackend({
      'POST /auth/refresh': () => ({ data: NEW_TOKENS }),
      'POST /missionaries/profile': onlyNewToken({ data: { missionary } }),
    });

    await expect(
      createMissionaryProfileAction({ missionaryAgencyId: AGENCY_ID })
    ).resolves.toMatchObject({ ok: true });
    expect(cookieValue(AUTH_COOKIE.accessToken)).toBeUndefined();
    expect(cookieValue(AUTH_COOKIE.refreshToken)).toBeUndefined();
  });

  it('rejects an agency id that is not a UUID', async () => {
    await expect(
      createMissionaryProfileAction({ missionaryAgencyId: 'outra' })
    ).resolves.toMatchObject({
      ok: false,
      status: 422,
      message: 'Selecione uma agência missionária válida',
    });
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });
});

describe('public profile saves', () => {
  it('saves the public contacts, expires the public profile and re-renders', async () => {
    mockBackend({
      'PATCH /missionaries/profile': () => ({ data: { missionary } }),
      'GET /account/profile': owner,
    });

    const result = await updatePublicContactsAction({
      publicEmail: 'contato@missao.org',
      publicPhone: null,
      publicPhoneIsWhatsapp: false,
    });

    expect(result).toEqual({ ok: true, data: { missionary } });
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/missionaries/profile', {
      method: 'PATCH',
      body: { publicEmail: 'contato@missao.org', publicPhone: null, publicPhoneIsWhatsapp: false },
      accessToken: ACCESS,
    });
    expect(cacheMock.updateTag).toHaveBeenCalledWith('profile:ana');
    expect(cacheMock.refresh).toHaveBeenCalledTimes(1);
  });

  it('rejects a public phone outside E.164', async () => {
    await expect(
      updatePublicContactsAction({ publicPhone: '21 9999-9999' })
    ).resolves.toMatchObject({ ok: false, status: 422, message: 'Contatos públicos inválidos' });
  });

  it('saves the "Sobre" fields with trimmed text and nulls', async () => {
    mockBackend({
      'PATCH /missionaries/about': () => ({ data: { missionary } }),
      'GET /account/profile': owner,
    });

    await updateAboutAction({ aboutMe: '  Sirvo no sertão ', lifeVerse: null });

    expect(backendMock.backendFetch).toHaveBeenCalledWith('/missionaries/about', {
      method: 'PATCH',
      body: { aboutMe: 'Sirvo no sertão', lifeVerse: null },
      accessToken: ACCESS,
    });
    expect(cacheMock.refresh).toHaveBeenCalled();
  });

  it('rejects an empty origin (short fields need a value or null)', async () => {
    await expect(updateAboutAction({ originLocation: '   ' })).resolves.toMatchObject({
      ok: false,
      status: 422,
      fieldErrors: { originLocation: expect.any(String) },
    });
  });

  it('saves the work address as a full replace', async () => {
    const workAddress = {
      zip: '48900-000',
      district: 'Centro',
      city: 'Juazeiro',
      state: 'BA',
      country: 'Brasil',
    };
    mockBackend({
      'PATCH /missionaries/work-address': () => ({ data: { workAddress } }),
      'GET /account/profile': owner,
    });

    await expect(updateWorkAddressAction(workAddress)).resolves.toEqual({
      ok: true,
      data: { workAddress },
    });
    expect(cacheMock.updateTag).toHaveBeenCalledWith('profile:ana');
  });

  it('still re-renders when the username lookup fails after saving', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockBackend({
      'PATCH /missionaries/about': () => ({ data: { missionary } }),
      'GET /account/profile': () => {
        throw backendError(500, { message: 'boom' });
      },
    });

    await expect(updateAboutAction({ lifeVerse: 'Fp 4:13' })).resolves.toMatchObject({
      ok: true,
    });
    expect(cacheMock.updateTag).not.toHaveBeenCalled();
    expect(cacheMock.refresh).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });

  it('neither expires the cache nor re-renders when the save fails', async () => {
    mockBackend({
      'PATCH /missionaries/about': () => {
        throw backendError(422, { message: 'Validation failure', code: 'E_VALIDATION_ERROR' });
      },
    });

    await expect(updateAboutAction({ lifeVerse: 'Fp 4:13' })).resolves.toMatchObject({
      ok: false,
      status: 422,
    });
    expect(cacheMock.updateTag).not.toHaveBeenCalled();
    expect(cacheMock.refresh).not.toHaveBeenCalled();
  });
});

describe('updateIdentityAction', () => {
  it('saves the private document without touching the public cache', async () => {
    mockBackend({ 'PATCH /missionaries/identity': () => ({ data: { missionary } }) });

    await expect(
      updateIdentityAction({ identityType: 'CPF', identityDocument: ' 52998224725 ' })
    ).resolves.toEqual({ ok: true, data: { missionary } });
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/missionaries/identity', {
      method: 'PATCH',
      body: { identityType: 'CPF', identityDocument: '52998224725' },
      accessToken: ACCESS,
    });
    expect(cacheMock.updateTag).not.toHaveBeenCalled();
    expect(cookieWrites).toEqual([]);
  });

  it('rejects an unknown document type', async () => {
    await expect(
      updateIdentityAction({ identityType: 'RG' as 'CPF', identityDocument: '1' })
    ).resolves.toMatchObject({ ok: false, status: 422 });
  });
});
