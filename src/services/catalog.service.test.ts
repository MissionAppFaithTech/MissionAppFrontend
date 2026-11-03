import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFaithCommunityAction, createMissionaryAgencyAction } from '@/app/actions/catalog';
import { ApiError } from '@/lib/api/client';

vi.mock('@/app/actions/catalog', () => ({
  createFaithCommunityAction: vi.fn(),
  createMissionaryAgencyAction: vi.fn(),
}));
import {
  createFaithCommunity,
  createMissionaryAgency,
  listFaithCommunities,
  listMissionaryAgencies,
  toCreateFaithCommunityPayload,
  toCreateMissionaryAgencyPayload,
} from './catalog.service';
import { EMPTY_FAITH_COMMUNITY, EMPTY_MISSIONARY_AGENCY } from '@/forms/register/options';

describe('catalog.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns missionary agencies from the BFF', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [{ id: 'agency-1', name: 'JOCUM' }] }),
      })
    );

    await expect(listMissionaryAgencies()).resolves.toEqual([{ id: 'agency-1', name: 'JOCUM' }]);
    expect(fetch).toHaveBeenCalledWith(
      '/api/missionary-agencies',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('returns faith communities from the BFF', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [{ id: 'community-1', name: 'Igreja Batista' }] }),
      })
    );

    await expect(listFaithCommunities()).resolves.toEqual([
      { id: 'community-1', name: 'Igreja Batista' },
    ]);
  });

  it('throws the API message when the BFF fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Falha no catálogo' }),
      })
    );

    await expect(listMissionaryAgencies()).rejects.toThrow('Falha no catálogo');
  });

  it('maps agency form fields to the backend create payload', () => {
    expect(
      toCreateMissionaryAgencyPayload({
        ...EMPTY_MISSIONARY_AGENCY,
        name: 'Nova Agência',
        phone: '+55 11 98765-4321',
        country: 'Brasil',
        website: 'agencia.org',
      })
    ).toEqual({
      name: 'Nova Agência',
      phoneNumber: '+5511987654321',
      addressLine1: undefined,
      addressLine2: undefined,
      city: undefined,
      state: undefined,
      country: 'Brasil',
      postalCode: undefined,
      website: 'https://agencia.org',
    });
  });

  it('does not send pastor fields on the church payload', () => {
    expect(
      toCreateFaithCommunityPayload({
        ...EMPTY_FAITH_COMMUNITY,
        name: 'Igreja Nova',
        churchPhone: '+5521987654321',
        pastorName: 'Pr. Ana',
        pastorPhone: '+5521912345678',
      })
    ).toEqual({
      name: 'Igreja Nova',
      phoneNumber: '+5521987654321',
      addressLine1: undefined,
      addressLine2: undefined,
      city: undefined,
      state: undefined,
      country: undefined,
      postalCode: undefined,
      website: undefined,
    });
  });

  it('creates an agency through the Server Action with the backend payload', async () => {
    vi.mocked(createMissionaryAgencyAction).mockResolvedValue({
      ok: true,
      data: { id: 'agency-2', name: 'Nova Agência' },
    });

    await expect(
      createMissionaryAgency({ ...EMPTY_MISSIONARY_AGENCY, name: 'Nova Agência' })
    ).resolves.toEqual({ id: 'agency-2', name: 'Nova Agência' });
    expect(createMissionaryAgencyAction).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Nova Agência' })
    );
  });

  it('creates a faith community through the Server Action', async () => {
    vi.mocked(createFaithCommunityAction).mockResolvedValue({
      ok: true,
      data: { id: 'church-2', name: 'Igreja Nova' },
    });

    await expect(
      createFaithCommunity({ ...EMPTY_FAITH_COMMUNITY, name: 'Igreja Nova' })
    ).resolves.toEqual({ id: 'church-2', name: 'Igreja Nova' });
  });

  it('localizes the error message of a failed create', async () => {
    vi.mocked(createFaithCommunityAction).mockResolvedValue({
      ok: false,
      status: 422,
      message: 'The name has already been taken',
    });

    const error = await createFaithCommunity({ ...EMPTY_FAITH_COMMUNITY, name: 'Igreja' }).catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(422);
    expect((error as ApiError).message).not.toBe('The name has already been taken');
  });
});
