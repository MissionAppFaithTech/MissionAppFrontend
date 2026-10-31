import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, PATCH } from './route';
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

function expectCookiesRewritten(response: Response) {
  const setCookie = response.headers.getSetCookie();
  expect(setCookie).toEqual(
    expect.arrayContaining([
      expect.stringMatching(/^ma_access_token=new-access;.*Max-Age=1200/),
      expect.stringMatching(/^ma_refresh_token=new-refresh;.*Max-Age=604800/),
    ])
  );
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
  clearRefreshCache();
  vi.mocked(backendFetch).mockReset();
  mockCookieStore.get.mockClear();
  setSession(ACCESS, 'rt-1');
});

describe('GET /api/account/profile', () => {
  it('answers 401 and clears cookies when there is no session', async () => {
    setSession();

    const res = await GET();

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: SESSION_EXPIRED });
    expectCookiesCleared(res);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('returns the profile with agency and community names resolved', async () => {
    mockBackend({
      'GET /account/profile': () => profileResponse(),
      [AGENCY_PATH]: agencyResponse,
      [COMMUNITY_PATH]: communityResponse,
    });

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      data: {
        user,
        missionary,
        workAddress,
        missionaryAgency: { id: AGENCY_ID, name: 'JMN' },
        faithCommunity: { id: COMMUNITY_ID, name: 'Igreja Batista Central' },
      },
    });
    expect(backendFetch).toHaveBeenCalledWith('/account/profile', { accessToken: ACCESS });
    expect(backendFetch).toHaveBeenCalledWith(`/missionary-agencies/${AGENCY_ID}`, {
      accessToken: ACCESS,
    });
    expect(backendFetch).toHaveBeenCalledWith(`/faith-communities/${COMMUNITY_ID}`, {
      accessToken: ACCESS,
    });
    expect(res.headers.getSetCookie()).toEqual([]);
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

    const pending = GET();
    await vi.waitFor(() => expect(started).toEqual(['agency', 'community']));
    releases.forEach((release) => release());
    const res = await pending;

    expect(res.status).toBe(200);
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

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.missionaryAgency).toEqual({ id: odd, name: 'Agência' });
    expect(body.data.faithCommunity).toBeNull();
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

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toMatchObject({
      missionary: null,
      workAddress: null,
      missionaryAgency: null,
      faithCommunity: null,
    });
    expect(backendFetch).toHaveBeenCalledTimes(1);
  });

  it('turns a 404 on a name lookup into null without failing the profile', async () => {
    mockBackend({
      'GET /account/profile': () => profileResponse(),
      [AGENCY_PATH]: () => {
        throw new BackendApiError('Not found', 404, { message: 'Agência não encontrada' });
      },
      [COMMUNITY_PATH]: communityResponse,
    });

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.missionaryAgency).toBeNull();
    expect(body.data.faithCommunity).toEqual({ id: COMMUNITY_ID, name: 'Igreja Batista Central' });
  });

  it('returns null when the catalog response lacks the expected entry', async () => {
    mockBackend({
      'GET /account/profile': () => profileResponse(),
      [AGENCY_PATH]: () => ({ data: {} }),
      [COMMUNITY_PATH]: communityResponse,
    });

    const res = await GET();

    expect((await res.json()).data.missionaryAgency).toBeNull();
  });

  it('keeps the profile when a name lookup fails (cosmetic) and leaves that name empty', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockBackend({
      'GET /account/profile': () => profileResponse(),
      [AGENCY_PATH]: agencyResponse,
      [COMMUNITY_PATH]: () => {
        throw new BackendApiError('Erro na API (500)', 500, '<html>boom</html>');
      },
    });

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.missionaryAgency).toEqual({ id: AGENCY_ID, name: 'JMN' });
    expect(body.data.faithCommunity).toBeNull();
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

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.user.username).toBe(user.username);
    expect(body.data.missionaryAgency).toBeNull();
    expect(body.data.faithCommunity).toBeNull();
    vi.mocked(console.error).mockRestore();
  });

  it('logs unexpected name lookup failures but not a missing (404) entry', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockBackend({
      'GET /account/profile': () => profileResponse(),
      [AGENCY_PATH]: () => {
        throw new BackendApiError('Not found', 404, undefined);
      },
      [COMMUNITY_PATH]: communityResponse,
    });

    await GET();
    expect(consoleError).not.toHaveBeenCalled();

    const boom = new BackendApiError('Erro na API (500)', 500, 'boom');
    mockBackend({
      'GET /account/profile': () => profileResponse(),
      [AGENCY_PATH]: () => {
        throw boom;
      },
      [COMMUNITY_PATH]: communityResponse,
    });

    await GET();
    expect(consoleError).toHaveBeenCalledWith(
      '[api/account/profile GET] missionaryAgency name lookup failed',
      boom
    );
    consoleError.mockRestore();
  });

  it('answers 502 with the pt-BR fallback when the backend is unreachable', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(backendFetch).mockRejectedValue(new TypeError('fetch failed'));

    const res = await GET();

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ message: 'Não foi possível carregar o perfil' });
    expect(consoleError).toHaveBeenCalledWith('[api/account/profile GET]', expect.any(TypeError));
    consoleError.mockRestore();
  });

  it('uses the names sent by the backend (#142) without calling the public catalog', async () => {
    mockBackend({
      'GET /account/profile': () =>
        profileResponse({
          missionaryAgency: { id: AGENCY_ID, name: 'JMN' },
          faithCommunity: null,
        }),
    });

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.missionaryAgency).toEqual({ id: AGENCY_ID, name: 'JMN' });
    expect(body.data.faithCommunity).toBeNull();
    expect(backendFetch).toHaveBeenCalledTimes(1);
  });

  it('still lets an expired session on a name lookup trigger the refresh flow', async () => {
    let profileCalls = 0;
    mockBackend({
      'POST /auth/refresh': refreshOk,
      'GET /account/profile': () => {
        profileCalls += 1;
        return profileResponse();
      },
      [AGENCY_PATH]: ({ accessToken }) => {
        if (accessToken !== NEW_TOKENS.accessToken) throw unauthorized();
        return agencyResponse();
      },
      [COMMUNITY_PATH]: communityResponse,
    });

    const res = await GET();

    expect(res.status).toBe(200);
    expect(profileCalls).toBe(2);
    expectCookiesRewritten(res);
  });

  it('does not swallow a 404 on the profile itself', async () => {
    mockBackend({
      'GET /account/profile': () => {
        throw new BackendApiError('Not found', 404, undefined);
      },
    });

    const res = await GET();

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({
      message: 'Não encontramos o que você procurava.',
    });
  });

  it('refreshes after a backend 401, retries every call with the new token and rewrites cookies', async () => {
    mockBackend({
      'POST /auth/refresh': refreshOk,
      'GET /account/profile': onlyNewToken(profileResponse()),
      [AGENCY_PATH]: onlyNewToken(agencyResponse()),
      [COMMUNITY_PATH]: onlyNewToken(communityResponse()),
    });

    const res = await GET();

    expect(res.status).toBe(200);
    expect((await res.json()).data.missionaryAgency.name).toBe('JMN');
    expect(backendFetch).toHaveBeenCalledWith('/auth/refresh', {
      method: 'POST',
      body: { refreshToken: 'rt-1' },
    });
    expect(backendFetch).toHaveBeenCalledWith(`/missionary-agencies/${AGENCY_ID}`, {
      accessToken: 'new-access',
    });
    expectCookiesRewritten(res);
  });

  it('answers 401 and clears cookies when the refresh fails', async () => {
    mockBackend({
      'POST /auth/refresh': () => {
        throw unauthorized();
      },
      'GET /account/profile': () => {
        throw unauthorized();
      },
    });

    const res = await GET();

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: SESSION_EXPIRED });
    expectCookiesCleared(res);
  });
});

describe('PATCH /api/account/profile', () => {
  const patch = (body: unknown) =>
    PATCH(
      new Request('http://localhost:3000/api/account/profile', {
        method: 'PATCH',
        body: typeof body === 'string' ? body : JSON.stringify(body),
      })
    );

  const updated = { data: { user: { ...user, fullName: 'Carlos Silva' } } };

  it('rejects a username with a valid prefix followed by invalid characters', async () => {
    const res = await patch({ username: 'carlos_ok!' });

    expect(res.status).toBe(422);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('answers 502 with the pt-BR fallback when saving and the backend is unreachable', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(backendFetch).mockRejectedValue(new TypeError('fetch failed'));

    const res = await patch({ fullName: 'Carlos Silva' });

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ message: 'Não foi possível salvar o perfil' });
    expect(consoleError).toHaveBeenCalledWith('[api/account/profile PATCH]', expect.any(TypeError));
    consoleError.mockRestore();
  });

  it('answers 400 for invalid JSON before touching the session', async () => {
    const res = await patch('{oops');

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: 'JSON inválido' });
    expect(backendFetch).not.toHaveBeenCalled();
    expect(mockCookieStore.get).not.toHaveBeenCalled();
  });

  it('answers 422 with fieldErrors for invalid fields', async () => {
    const res = await patch({ username: 'Carlos Silva', biography: 'x'.repeat(201) });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.message).toBe('Dados de perfil inválidos');
    expect(Object.keys(body.fieldErrors).sort()).toEqual(['biography', 'username']);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('answers 422 for an empty fullName', async () => {
    const res = await patch({ fullName: '   ' });

    expect(res.status).toBe(422);
    expect((await res.json()).fieldErrors).toHaveProperty('fullName');
  });

  it('sends the trimmed fields to the backend and returns the updated user', async () => {
    mockBackend({ 'PATCH /account/profile': () => updated });

    const res = await patch({
      fullName: '  Carlos Silva ',
      username: 'carlos_silva',
      biography: ' Nova bio ',
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ data: updated.data });
    expect(backendFetch).toHaveBeenCalledWith('/account/profile', {
      method: 'PATCH',
      accessToken: ACCESS,
      body: { fullName: 'Carlos Silva', username: 'carlos_silva', biography: 'Nova bio' },
    });
  });

  it('passes biography: null through to clear the mini-bio', async () => {
    mockBackend({ 'PATCH /account/profile': () => updated });

    const res = await patch({ biography: null });

    expect(res.status).toBe(200);
    expect(vi.mocked(backendFetch).mock.calls[0][1]).toMatchObject({ body: { biography: null } });
  });

  it('forwards only the provided fields and strips unknown ones', async () => {
    mockBackend({ 'PATCH /account/profile': () => updated });

    await patch({ fullName: 'Carlos Silva', role: 'ADMIN', email: 'x@y.com' });

    expect(vi.mocked(backendFetch).mock.calls[0][1]?.body).toEqual({ fullName: 'Carlos Silva' });
  });

  it('maps the backend "username taken" message to fieldErrors.username', async () => {
    mockBackend({
      'PATCH /account/profile': () => {
        throw new BackendApiError('Nome de usuário já está em uso', 422, {
          message: 'Nome de usuário já está em uso',
        });
      },
    });

    const res = await patch({ username: 'taken_name' });

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      message: 'Nome de usuário já está em uso',
      fieldErrors: { username: 'Nome de usuário já está em uso' },
    });
  });

  it('maps Vine 422 errors to localized fieldErrors', async () => {
    mockBackend({
      'PATCH /account/profile': () => {
        throw new BackendApiError('Validation failure', 422, {
          errors: [
            { field: 'fullName', message: 'too long', rule: 'maxLength', meta: { max: 255 } },
          ],
        });
      },
    });

    const res = await patch({ fullName: 'Carlos' });

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      message: 'Use no máximo 255 caracteres.',
      fieldErrors: { fullName: 'Use no máximo 255 caracteres.' },
    });
  });

  it('answers 401 for a valid body without a session', async () => {
    setSession();

    const res = await patch({ fullName: 'Carlos' });

    expect(res.status).toBe(401);
    expectCookiesCleared(res);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('refreshes after a backend 401, retries and rewrites cookies', async () => {
    mockBackend({
      'POST /auth/refresh': refreshOk,
      'PATCH /account/profile': onlyNewToken(updated),
    });

    const res = await patch({ fullName: 'Carlos Silva' });

    expect(res.status).toBe(200);
    expect(vi.mocked(backendFetch).mock.calls.map(([path]) => path)).toEqual([
      '/account/profile',
      '/auth/refresh',
      '/account/profile',
    ]);
    expectCookiesRewritten(res);
  });

  it('answers 401 and clears cookies when the refresh fails', async () => {
    mockBackend({
      'POST /auth/refresh': () => {
        throw unauthorized();
      },
      'PATCH /account/profile': () => {
        throw unauthorized();
      },
    });

    const res = await patch({ fullName: 'Carlos Silva' });

    expect(res.status).toBe(401);
    expectCookiesCleared(res);
  });
});
