import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { fetchAccountProfile } from './accountProfile';

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

const ACCESS = 'access-token';

type FetchOptions = { method?: string; accessToken?: string };
type RouteHandler = (options: FetchOptions) => unknown;

/** Routes mocked backend calls by `"<METHOD> <path>"`; unknown routes fail the test. */
function mockBackend(routes: Record<string, RouteHandler>) {
  vi.mocked(backendFetch).mockImplementation(async (path: string, options: FetchOptions = {}) => {
    const handler = routes[`${options.method ?? 'GET'} ${path}`];
    if (!handler) throw new Error(`Unexpected backend call: ${options.method ?? 'GET'} ${path}`);
    return handler(options);
  });
}

const AGENCY_ID = '018f0000-0000-7000-8000-00000000a6e1';
const COMMUNITY_ID = '018f0000-0000-7000-8000-0000000c0de1';

const user = {
  id: 'usr-1',
  fullName: 'Pr. Carlos Oliveira',
  username: 'pr_carlos',
  email: 'carlos@example.com',
  phoneNumber: '+5511999999999',
  biography: 'Plantador de igrejas no sertão',
  profilePictureId: null,
  role: 'MISSIONARY',
};
const missionary = {
  id: '018f0000-0000-7000-8000-000000000001',
  aboutMe: 'Chamado para o Nordeste',
  originLocation: 'Recife/PE',
  missionaryAgencyId: AGENCY_ID,
  faithCommunityId: COMMUNITY_ID,
};
const workAddress = {
  zip: '48900-000',
  district: 'Centro',
  city: 'Juazeiro',
  state: 'BA',
  country: 'Brasil',
};

const profileResponse = (overrides: Record<string, unknown> = {}) => ({
  data: { user, missionary, workAddress, ...overrides },
});
const agencyResponse = () => ({
  data: { missionaryAgency: { id: AGENCY_ID, name: 'JMN', city: 'Rio' } },
});
const communityResponse = () => ({
  data: { faithCommunity: { id: COMMUNITY_ID, name: 'Igreja Batista Central', city: 'SP' } },
});

const AGENCY_PATH = `GET /missionary-agencies/${AGENCY_ID}`;
const COMMUNITY_PATH = `GET /faith-communities/${COMMUNITY_ID}`;

beforeEach(() => {
  vi.mocked(backendFetch).mockReset();
});

describe('fetchAccountProfile', () => {
  it('returns the profile with agency and community names resolved', async () => {
    mockBackend({
      'GET /account/profile': () => profileResponse(),
      [AGENCY_PATH]: agencyResponse,
      [COMMUNITY_PATH]: communityResponse,
    });

    await expect(fetchAccountProfile(ACCESS)).resolves.toEqual({
      user,
      missionary,
      workAddress,
      missionaryAgency: { id: AGENCY_ID, name: 'JMN' },
      faithCommunity: { id: COMMUNITY_ID, name: 'Igreja Batista Central' },
    });
    expect(backendFetch).toHaveBeenCalledWith('/account/profile', { accessToken: ACCESS });
    expect(backendFetch).toHaveBeenCalledWith(`/missionary-agencies/${AGENCY_ID}`, {
      accessToken: ACCESS,
    });
    expect(backendFetch).toHaveBeenCalledWith(`/faith-communities/${COMMUNITY_ID}`, {
      accessToken: ACCESS,
    });
  });

  it('starts both name lookups before either one finishes', async () => {
    const started: string[] = [];
    const releases: Array<() => void> = [];
    const deferred = (label: string, value: unknown) => () => {
      started.push(label);
      return new Promise((resolve) => releases.push(() => resolve(value)));
    };
    mockBackend({
      'GET /account/profile': () => profileResponse(),
      [AGENCY_PATH]: deferred('agency', agencyResponse()),
      [COMMUNITY_PATH]: deferred('community', communityResponse()),
    });

    const pending = fetchAccountProfile(ACCESS);
    await vi.waitFor(() => expect(started).toEqual(['agency', 'community']));
    releases.forEach((release) => release());

    await expect(pending).resolves.toMatchObject({ missionaryAgency: { name: 'JMN' } });
  });

  it('URL-encodes catalog ids in the lookup paths', async () => {
    const odd = 'id with/slash';
    mockBackend({
      'GET /account/profile': () =>
        profileResponse({
          missionary: { ...missionary, missionaryAgencyId: odd, faithCommunityId: null },
        }),
      'GET /missionary-agencies/id%20with%2Fslash': () => ({
        data: { missionaryAgency: { id: odd, name: 'Agência' } },
      }),
    });

    const data = await fetchAccountProfile(ACCESS);

    expect(data.missionaryAgency).toEqual({ id: odd, name: 'Agência' });
    expect(data.faithCommunity).toBeNull();
  });

  it('skips the lookups for a supporter without a missionary profile', async () => {
    mockBackend({
      'GET /account/profile': () =>
        profileResponse({
          user: { ...user, role: 'SUPPORTER' },
          missionary: null,
          workAddress: null,
        }),
    });

    await expect(fetchAccountProfile(ACCESS)).resolves.toMatchObject({
      missionary: null,
      workAddress: null,
      missionaryAgency: null,
      faithCommunity: null,
    });
    expect(backendFetch).toHaveBeenCalledTimes(1);
  });

  it('uses the names sent by the backend (#142) without calling the public catalog', async () => {
    mockBackend({
      'GET /account/profile': () =>
        profileResponse({
          missionaryAgency: { id: AGENCY_ID, name: 'JMN' },
          faithCommunity: null,
        }),
    });

    const data = await fetchAccountProfile(ACCESS);

    expect(data.missionaryAgency).toEqual({ id: AGENCY_ID, name: 'JMN' });
    expect(data.faithCommunity).toBeNull();
    expect(backendFetch).toHaveBeenCalledTimes(1);
  });

  it('turns a 404 on a name lookup into null, silently, without failing the profile', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockBackend({
      'GET /account/profile': () => profileResponse(),
      [AGENCY_PATH]: () => {
        throw new BackendApiError('Not found', 404, { message: 'Agência não encontrada' });
      },
      [COMMUNITY_PATH]: communityResponse,
    });

    const data = await fetchAccountProfile(ACCESS);

    expect(data.missionaryAgency).toBeNull();
    expect(data.faithCommunity).toEqual({ id: COMMUNITY_ID, name: 'Igreja Batista Central' });
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('returns null when the catalog response lacks the expected entry', async () => {
    mockBackend({
      'GET /account/profile': () => profileResponse(),
      [AGENCY_PATH]: () => ({ data: {} }),
      [COMMUNITY_PATH]: communityResponse,
    });

    await expect(fetchAccountProfile(ACCESS)).resolves.toMatchObject({ missionaryAgency: null });
  });

  it('keeps the profile and logs when a name lookup fails (the name is cosmetic)', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const boom = new BackendApiError('Erro na API (500)', 500, '<html>boom</html>');
    mockBackend({
      'GET /account/profile': () => profileResponse(),
      [AGENCY_PATH]: agencyResponse,
      [COMMUNITY_PATH]: () => {
        throw boom;
      },
    });

    const data = await fetchAccountProfile(ACCESS);

    expect(data.missionaryAgency).toEqual({ id: AGENCY_ID, name: 'JMN' });
    expect(data.faithCommunity).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      '[account profile] faithCommunity name lookup failed',
      boom
    );
    consoleError.mockRestore();
  });

  it('keeps the profile when the public catalog rate limit (429) is reached', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const tooMany = () => {
      throw new BackendApiError('Too many requests', 429, { message: 'Too many requests' });
    };
    mockBackend({
      'GET /account/profile': () => profileResponse(),
      [AGENCY_PATH]: tooMany,
      [COMMUNITY_PATH]: tooMany,
    });

    const data = await fetchAccountProfile(ACCESS);

    expect(data.user.username).toBe(user.username);
    expect(data.missionaryAgency).toBeNull();
    expect(data.faithCommunity).toBeNull();
    vi.mocked(console.error).mockRestore();
  });

  it('rethrows a 401 on a name lookup so the caller can renew or end the session', async () => {
    const unauthorized = new BackendApiError('Erro na API (401)', 401, 'Unauthorized access');
    mockBackend({
      'GET /account/profile': () => profileResponse(),
      [AGENCY_PATH]: () => {
        throw unauthorized;
      },
      [COMMUNITY_PATH]: communityResponse,
    });

    await expect(fetchAccountProfile(ACCESS)).rejects.toBe(unauthorized);
  });

  it('does not swallow errors on the profile itself', async () => {
    const notFound = new BackendApiError('Not found', 404, undefined);
    mockBackend({
      'GET /account/profile': () => {
        throw notFound;
      },
    });

    await expect(fetchAccountProfile(ACCESS)).rejects.toBe(notFound);
  });
});
