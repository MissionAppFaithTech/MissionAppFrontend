import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearRefreshCache } from '@/lib/api/bff';
import {
  ACCESS,
  backendError,
  backendMock,
  cacheMock,
  mockBackend,
  resetActionHarness,
} from '@/test/actionHarness';
import { updateAboutAction, updatePublicContactsAction } from './missionary';

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

  it('saves the agency, the community and the work address in the same request', async () => {
    const workAddress = {
      zip: '48900-000',
      district: 'Centro',
      city: 'Juazeiro',
      state: 'BA',
      country: 'Brasil',
    };
    const payload = {
      missionary,
      workAddress,
      missionaryAgency: { id: AGENCY_ID, name: 'JOCUM' },
      faithCommunity: null,
    };
    mockBackend({
      'PATCH /missionaries/about': () => ({ data: payload }),
      'GET /account/profile': owner,
    });

    await expect(
      updateAboutAction({ missionaryAgencyId: AGENCY_ID, faithCommunityId: null, workAddress })
    ).resolves.toEqual({ ok: true, data: payload });
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/missionaries/about', {
      method: 'PATCH',
      body: { missionaryAgencyId: AGENCY_ID, faithCommunityId: null, workAddress },
      accessToken: ACCESS,
    });
    expect(backendMock.backendFetch).not.toHaveBeenCalledWith(
      '/missionaries/work-address',
      expect.anything()
    );
    expect(cacheMock.updateTag).toHaveBeenCalledWith('profile:ana');
  });

  it('rejects an incomplete work address and an agency id that is not a UUID', async () => {
    await expect(
      updateAboutAction({
        workAddress: { zip: '', district: 'Centro', city: 'Juazeiro', state: 'BA', country: 'BR' },
      })
    ).resolves.toMatchObject({
      ok: false,
      status: 422,
      fieldErrors: { workAddress: expect.any(String) },
    });
    await expect(updateAboutAction({ missionaryAgencyId: 'outra' })).resolves.toMatchObject({
      ok: false,
      status: 422,
      fieldErrors: { missionaryAgencyId: expect.any(String) },
    });
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
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
