import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createFaithCommunityAction,
  createMissionaryAgencyAction,
  updateFaithCommunityAction,
} from '@/app/actions/catalog';
import { ApiError } from '@/lib/api/client';

vi.mock('@/app/actions/catalog', () => ({
  createFaithCommunityAction: vi.fn(),
  createMissionaryAgencyAction: vi.fn(),
  updateFaithCommunityAction: vi.fn(),
}));
vi.mock('@/services/queries/catalog', () => ({ invalidateCatalogSearches: vi.fn() }));
import { invalidateCatalogSearches } from '@/services/queries/catalog';
import {
  createFaithCommunity,
  createMissionaryAgency,
  getFaithCommunity,
  searchCatalog,
  toCreateFaithCommunityPayload,
  toCreateMissionaryAgencyPayload,
  updateFaithCommunity,
} from './catalog.service';
import { EMPTY_FAITH_COMMUNITY, EMPTY_MISSIONARY_AGENCY } from '@/forms/register/options';

function stubFetch(ok: boolean, status: number, json: () => Promise<unknown>) {
  const fetchMock = vi.fn().mockResolvedValue({ ok, status, json });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('catalog.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(invalidateCatalogSearches).mockReset();
  });

  it('searches agencies through the BFF with the term, page size and abort signal', async () => {
    const fetchMock = stubFetch(true, 200, async () => ({
      data: [{ id: 'agency-1', name: 'JOCUM' }],
      meta: { hasMore: true },
    }));
    const controller = new AbortController();

    await expect(
      searchCatalog('missionaryAgencies', 'jo cum', { signal: controller.signal })
    ).resolves.toEqual({ items: [{ id: 'agency-1', name: 'JOCUM' }], hasMore: true });
    expect(fetchMock).toHaveBeenCalledWith('/api/missionary-agencies?search=jo+cum&limit=10', {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
  });

  it('searches faith communities and reads a body without meta as the last page', async () => {
    const fetchMock = stubFetch(true, 200, async () => ({
      data: [{ id: 'community-1', name: 'Igreja Batista' }],
    }));

    await expect(searchCatalog('faithCommunities', 'igreja')).resolves.toEqual({
      items: [{ id: 'community-1', name: 'Igreja Batista' }],
      hasMore: false,
    });
    expect(fetchMock.mock.calls[0][0]).toBe('/api/faith-communities?search=igreja&limit=10');
  });

  it('answers an empty last page when an OK body is not JSON', async () => {
    stubFetch(true, 200, async () => {
      throw new SyntaxError('not json');
    });

    await expect(searchCatalog('missionaryAgencies', 'jo')).resolves.toEqual({
      items: [],
      hasMore: false,
    });
  });

  it('answers no items when the body is not a list', async () => {
    stubFetch(true, 200, async () => ({ data: 'oops' }));

    await expect(searchCatalog('faithCommunities', 'igreja')).resolves.toEqual({
      items: [],
      hasMore: false,
    });
  });

  it('throws an ApiError with the BFF message and status', async () => {
    stubFetch(false, 429, async () => ({ message: 'Muitas buscas seguidas.' }));

    const error = await searchCatalog('missionaryAgencies', 'jo').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 429, message: 'Muitas buscas seguidas.' });
  });

  it.each([
    ['missionaryAgencies', 'Não foi possível buscar as agências missionárias'],
    ['faithCommunities', 'Não foi possível buscar as comunidades de fé'],
  ] as const)('falls back to a pt-BR message for %s', async (kind, message) => {
    stubFetch(false, 502, async () => {
      throw new SyntaxError('not json');
    });

    await expect(searchCatalog(kind, 'jo')).rejects.toMatchObject({ status: 502, message });
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

  it('sends the pastor with the church, the phone in E.164', () => {
    expect(
      toCreateFaithCommunityPayload({
        ...EMPTY_FAITH_COMMUNITY,
        name: 'Igreja Nova',
        churchPhone: '+5521987654321',
        pastorName: ' Pr. Ana ',
        pastorPhone: '+55 (21) 91234-5678',
      })
    ).toEqual({
      name: 'Igreja Nova',
      phoneNumber: '+5521987654321',
      pastorName: 'Pr. Ana',
      pastorPhone: '+5521912345678',
      addressLine1: undefined,
      addressLine2: undefined,
      city: undefined,
      state: undefined,
      country: undefined,
      postalCode: undefined,
      website: undefined,
    });
  });

  it('leaves the pastor out when it was not informed', () => {
    const payload = toCreateFaithCommunityPayload({
      ...EMPTY_FAITH_COMMUNITY,
      name: 'Igreja Nova',
      pastorName: '  ',
      pastorPhone: '+55',
    });
    expect(payload.pastorName).toBeUndefined();
    expect(payload.pastorPhone).toBeUndefined();
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
    // The next search of the catalog must include the new agency.
    expect(invalidateCatalogSearches).toHaveBeenCalledWith('missionaryAgencies');
  });

  it('creates a faith community through the Server Action', async () => {
    vi.mocked(createFaithCommunityAction).mockResolvedValue({
      ok: true,
      data: { id: 'church-2', name: 'Igreja Nova' },
    });

    await expect(
      createFaithCommunity({ ...EMPTY_FAITH_COMMUNITY, name: 'Igreja Nova' })
    ).resolves.toEqual({ id: 'church-2', name: 'Igreja Nova' });
    expect(invalidateCatalogSearches).toHaveBeenCalledWith('faithCommunities');
  });

  it('passes on the pt-BR message and code of a failed create', async () => {
    vi.mocked(createFaithCommunityAction).mockResolvedValue({
      ok: false,
      status: 409,
      message: 'Esta ação entra em conflito com dados já existentes.',
      code: 'E_CONFLICT',
    });

    const error = await createFaithCommunity({ ...EMPTY_FAITH_COMMUNITY, name: 'Igreja' }).catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(invalidateCatalogSearches).not.toHaveBeenCalled();
    expect(error).toMatchObject({
      status: 409,
      message: 'Esta ação entra em conflito com dados já existentes.',
      code: 'E_CONFLICT',
    });
  });

  it('loads and maps a faith community by id from the BFF', async () => {
    stubFetch(true, 200, async () => ({
      data: {
        faithCommunity: {
          id: 'fc-1',
          name: 'Igreja Batista Central',
          phoneNumber: '+552134567890',
          addressLine1: 'Rua A, 10',
          addressLine2: 'Sala 1',
          city: 'Niterói',
          state: 'RJ',
          country: 'Brasil',
          postalCode: '24020000',
          website: 'https://ibc.org.br',
          pastorName: 'Pr. João',
          pastorPhone: '+5521987654321',
        },
      },
    }));

    await expect(getFaithCommunity('fc-1')).resolves.toEqual({
      name: 'Igreja Batista Central',
      address1: 'Rua A, 10',
      address2: 'Sala 1',
      city: 'Niterói',
      state: 'RJ',
      country: 'Brasil',
      zipCode: '24020-000',
      website: 'https://ibc.org.br',
      churchPhone: '+552134567890',
      pastorName: 'Pr. João',
      pastorPhone: '+5521987654321',
    });
  });

  it('updates a faith community through the Server Action and invalidates searches', async () => {
    vi.mocked(updateFaithCommunityAction).mockResolvedValue({
      ok: true,
      data: { id: 'fc-1', name: 'Igreja Batista Renovada' },
    });

    await expect(
      updateFaithCommunity('fc-1', {
        ...EMPTY_FAITH_COMMUNITY,
        name: 'Igreja Batista Renovada',
        city: 'Niterói',
      })
    ).resolves.toEqual({ id: 'fc-1', name: 'Igreja Batista Renovada' });
    expect(updateFaithCommunityAction).toHaveBeenCalledWith(
      'fc-1',
      expect.objectContaining({ name: 'Igreja Batista Renovada', city: 'Niterói' })
    );
    expect(invalidateCatalogSearches).toHaveBeenCalledWith('faithCommunities');
  });
});
