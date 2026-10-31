import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATCH } from './route';
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

const patch = (body: unknown) =>
  PATCH(
    new Request('http://localhost:3000/api/missionaries/about', {
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  );

const COMMUNITY_ID = '018f0000-0000-7000-8000-0000000c0de1';
const saved = { data: { missionary: { id: 'm-1', aboutMe: 'Sobre atualizado' } } };

beforeEach(() => {
  clearRefreshCache();
  vi.mocked(backendFetch).mockReset();
  mockCookieStore.get.mockClear();
  setSession(ACCESS, 'rt-1');
});

describe('PATCH /api/missionaries/about', () => {
  it('sends the trimmed fields to the backend and returns the missionary', async () => {
    mockBackend({ 'PATCH /missionaries/about': () => saved });

    const res = await patch({
      aboutMe: '  Sobre atualizado ',
      missionStorySummary: 'Resumo',
      originLocation: ' Campinas/SP ',
      prayerRequest: 'Orem pela equipe',
      lifeVerse: 'Jo 3:16',
      faithCommunityId: COMMUNITY_ID,
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(saved);
    expect(backendFetch).toHaveBeenCalledWith('/missionaries/about', {
      method: 'PATCH',
      accessToken: ACCESS,
      body: {
        aboutMe: 'Sobre atualizado',
        missionStorySummary: 'Resumo',
        originLocation: 'Campinas/SP',
        prayerRequest: 'Orem pela equipe',
        lifeVerse: 'Jo 3:16',
        faithCommunityId: COMMUNITY_ID,
      },
    });
  });

  it('passes null through so the backend clears those fields', async () => {
    mockBackend({ 'PATCH /missionaries/about': () => saved });

    const res = await patch({
      aboutMe: null,
      missionStorySummary: null,
      originLocation: null,
      prayerRequest: null,
      lifeVerse: null,
    });

    expect(res.status).toBe(200);
    expect(vi.mocked(backendFetch).mock.calls[0][1]?.body).toEqual({
      aboutMe: null,
      missionStorySummary: null,
      originLocation: null,
      prayerRequest: null,
      lifeVerse: null,
    });
  });

  it('forwards only the provided fields and strips unknown ones', async () => {
    mockBackend({ 'PATCH /missionaries/about': () => saved });

    await patch({ lifeVerse: 'Sl 23', status: 'APPROVED' });

    expect(vi.mocked(backendFetch).mock.calls[0][1]?.body).toEqual({ lifeVerse: 'Sl 23' });
  });

  it('accepts an empty long text (no minimum length)', async () => {
    mockBackend({ 'PATCH /missionaries/about': () => saved });

    const res = await patch({ aboutMe: '   ' });

    expect(res.status).toBe(200);
    expect(vi.mocked(backendFetch).mock.calls[0][1]?.body).toEqual({ aboutMe: '' });
  });

  it('answers 422 for empty short texts and an invalid faithCommunityId', async () => {
    const res = await patch({ originLocation: '', lifeVerse: ' ', faithCommunityId: '' });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.message).toBe('Dados do Sobre inválidos');
    expect(Object.keys(body.fieldErrors).sort()).toEqual([
      'faithCommunityId',
      'lifeVerse',
      'originLocation',
    ]);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('answers 422 when a text exceeds its maximum length', async () => {
    const res = await patch({ aboutMe: 'a'.repeat(5001), lifeVerse: 'v'.repeat(256) });

    expect(res.status).toBe(422);
    expect(Object.keys((await res.json()).fieldErrors).sort()).toEqual(['aboutMe', 'lifeVerse']);
  });

  it('rejects null for faithCommunityId (it cannot be cleared)', async () => {
    const res = await patch({ faithCommunityId: null });

    expect(res.status).toBe(422);
    expect((await res.json()).fieldErrors).toHaveProperty('faithCommunityId');
  });

  it('answers 400 for invalid JSON', async () => {
    const res = await patch('not-json');

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: 'JSON inválido' });
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('maps "Comunidade de fé informada não existe" to fieldErrors.faithCommunityId', async () => {
    mockBackend({
      'PATCH /missionaries/about': () => {
        throw new BackendApiError('Comunidade de fé informada não existe', 422, {
          message: 'Comunidade de fé informada não existe',
        });
      },
    });

    const res = await patch({ faithCommunityId: COMMUNITY_ID });

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      message: 'Comunidade de fé informada não existe',
      fieldErrors: { faithCommunityId: 'Comunidade de fé informada não existe' },
    });
  });

  it('maps Vine 422 errors to localized fieldErrors', async () => {
    mockBackend({
      'PATCH /missionaries/about': () => {
        throw new BackendApiError('Validation failure', 422, {
          errors: [
            { field: 'lifeVerse', message: 'too long', rule: 'maxLength', meta: { max: 255 } },
          ],
        });
      },
    });

    const res = await patch({ lifeVerse: 'Sl 23' });

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      message: 'Use no máximo 255 caracteres.',
      fieldErrors: { lifeVerse: 'Use no máximo 255 caracteres.' },
    });
  });

  it('maps a 403 (not a missionary) to the pt-BR permission message', async () => {
    mockBackend({
      'PATCH /missionaries/about': () => {
        throw new BackendApiError('Forbidden', 403, undefined);
      },
    });

    const res = await patch({ aboutMe: 'Texto' });

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({
      message: 'Você não tem permissão para realizar esta ação.',
    });
  });

  it('answers 401 and clears cookies without a session', async () => {
    setSession();

    const res = await patch({ aboutMe: 'Texto' });

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: SESSION_EXPIRED });
    expectCookiesCleared(res);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('refreshes after a backend 401, retries and rewrites cookies', async () => {
    mockBackend({
      'POST /auth/refresh': refreshOk,
      'PATCH /missionaries/about': onlyNewToken(saved),
    });

    const res = await patch({ aboutMe: 'Texto' });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(saved);
    expect(backendFetch).toHaveBeenLastCalledWith('/missionaries/about', {
      method: 'PATCH',
      accessToken: 'new-access',
      body: { aboutMe: 'Texto' },
    });
    expectCookiesRewritten(res);
  });

  it('answers 401 and clears cookies when the refresh fails', async () => {
    mockBackend({
      'POST /auth/refresh': () => {
        throw unauthorized();
      },
      'PATCH /missionaries/about': () => {
        throw unauthorized();
      },
    });

    const res = await patch({ aboutMe: 'Texto' });

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: SESSION_EXPIRED });
    expectCookiesCleared(res);
  });
});
