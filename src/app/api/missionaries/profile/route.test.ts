import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATCH, POST } from './route';
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

const AGENCY_ID = '018f1111-2222-7333-8444-555555555555';

const send = (method: 'PATCH' | 'POST', body: unknown) => {
  const request = new Request('http://localhost:3000/api/missionaries/profile', {
    method,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  return method === 'PATCH' ? PATCH(request) : POST(request);
};

const saved = {
  data: { missionary: { id: 'm-2', publicEmail: 'contato@carlos.com', publicPhone: null } },
};

beforeEach(() => {
  clearRefreshCache();
  vi.mocked(backendFetch).mockReset();
  mockCookieStore.get.mockClear();
  setSession(ACCESS, 'rt-1');
});

describe('PATCH /api/missionaries/profile', () => {
  it('updates the public contacts via the backend', async () => {
    mockBackend({ 'PATCH /missionaries/profile': () => saved });

    const res = await send('PATCH', {
      publicEmail: 'contato@carlos.com',
      publicPhone: '+5511999999999',
      donationMessage: '  Contribua pelo PIX ',
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(saved);
    expect(backendFetch).toHaveBeenCalledWith('/missionaries/profile', {
      method: 'PATCH',
      accessToken: ACCESS,
      body: {
        publicEmail: 'contato@carlos.com',
        publicPhone: '+5511999999999',
        donationMessage: 'Contribua pelo PIX',
      },
    });
    expect(res.headers.getSetCookie()).toEqual([]);
  });

  it('passes null through so the backend removes the public contacts', async () => {
    mockBackend({ 'PATCH /missionaries/profile': () => saved });

    const res = await send('PATCH', {
      publicEmail: null,
      publicPhone: null,
      donationMessage: null,
    });

    expect(res.status).toBe(200);
    expect(vi.mocked(backendFetch).mock.calls[0][1]?.body).toEqual({
      publicEmail: null,
      publicPhone: null,
      donationMessage: null,
    });
  });

  it('forwards only the provided fields and strips unknown ones', async () => {
    mockBackend({ 'PATCH /missionaries/profile': () => saved });

    await send('PATCH', { publicPhone: '+14155552671', missionaryAgencyId: AGENCY_ID });

    expect(vi.mocked(backendFetch).mock.calls[0][1]?.body).toEqual({
      publicPhone: '+14155552671',
    });
  });

  it('answers 422 for an invalid e-mail and a non-E.164 phone', async () => {
    const res = await send('PATCH', { publicEmail: 'not-an-email', publicPhone: '11 99999-9999' });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.message).toBe('Contatos públicos inválidos');
    expect(Object.keys(body.fieldErrors).sort()).toEqual(['publicEmail', 'publicPhone']);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('answers 422 for an empty string instead of null', async () => {
    const res = await send('PATCH', { publicEmail: '' });

    expect(res.status).toBe(422);
    expect((await res.json()).fieldErrors).toHaveProperty('publicEmail');
  });

  it('answers 400 for invalid JSON', async () => {
    const res = await send('PATCH', '{');

    expect(res.status).toBe(400);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('maps Vine 422 errors to localized fieldErrors', async () => {
    mockBackend({
      'PATCH /missionaries/profile': () => {
        throw new BackendApiError('Validation failure', 422, {
          errors: [{ field: 'publicEmail', message: 'invalid', rule: 'email' }],
        });
      },
    });

    const res = await send('PATCH', { publicEmail: 'contato@carlos.com' });

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      message: 'Informe um e-mail válido.',
      fieldErrors: { publicEmail: 'Informe um e-mail válido.' },
    });
  });

  it('answers 401 and clears cookies without a session', async () => {
    setSession();

    const res = await send('PATCH', { publicEmail: null });

    expect(res.status).toBe(401);
    expectCookiesCleared(res);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('refreshes after a backend 401, retries and rewrites cookies', async () => {
    mockBackend({
      'POST /auth/refresh': refreshOk,
      'PATCH /missionaries/profile': onlyNewToken(saved),
    });

    const res = await send('PATCH', { publicEmail: 'contato@carlos.com' });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(saved);
    expectCookiesRewritten(res);
  });

  it('answers 401 and clears cookies when the refresh fails', async () => {
    mockBackend({
      'POST /auth/refresh': () => {
        throw unauthorized();
      },
      'PATCH /missionaries/profile': () => {
        throw unauthorized();
      },
    });

    const res = await send('PATCH', { publicEmail: 'contato@carlos.com' });

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: SESSION_EXPIRED });
    expectCookiesCleared(res);
  });
});

describe('POST /api/missionaries/profile', () => {
  const created = { data: { missionary: { id: 'm-created', missionaryAgencyId: AGENCY_ID } } };

  it('creates the missionary profile, asks for re-authentication and clears the cookies', async () => {
    mockBackend({ 'POST /missionaries/profile': () => created });

    const res = await send('POST', { missionaryAgencyId: AGENCY_ID });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      data: { missionary: created.data.missionary, reauthenticationRequired: true },
    });
    expect(backendFetch).toHaveBeenCalledWith('/missionaries/profile', {
      method: 'POST',
      accessToken: ACCESS,
      body: { missionaryAgencyId: AGENCY_ID },
    });
    expectCookiesCleared(res);
  });

  it('answers 422 when the agency id is missing or not a UUID', async () => {
    for (const body of [{}, { missionaryAgencyId: 'agency-1' }]) {
      const res = await send('POST', body);

      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.message).toBe('Selecione uma agência missionária válida');
      expect(json.fieldErrors).toHaveProperty('missionaryAgencyId');
    }
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('answers 400 for invalid JSON', async () => {
    const res = await send('POST', 'nope');

    expect(res.status).toBe(400);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('keeps the cookies when the backend rejects the conversion', async () => {
    mockBackend({
      'POST /missionaries/profile': () => {
        throw new BackendApiError('Conflict', 409, undefined);
      },
    });

    const res = await send('POST', { missionaryAgencyId: AGENCY_ID });

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toEqual({
      message: 'Esta ação entra em conflito com dados já existentes.',
    });
    expect(res.headers.getSetCookie()).toEqual([]);
  });

  it('answers 401 and clears cookies without a session', async () => {
    setSession();

    const res = await send('POST', { missionaryAgencyId: AGENCY_ID });

    expect(res.status).toBe(401);
    expectCookiesCleared(res);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('answers 401 and clears cookies when the refresh after a 401 fails', async () => {
    mockBackend({
      'POST /auth/refresh': () => {
        throw unauthorized();
      },
      'POST /missionaries/profile': () => {
        throw unauthorized();
      },
    });

    const res = await send('POST', { missionaryAgencyId: AGENCY_ID });

    expect(res.status).toBe(401);
    expectCookiesCleared(res);
  });
});
