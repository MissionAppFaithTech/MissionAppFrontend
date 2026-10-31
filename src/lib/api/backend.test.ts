import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BackendApiError, backendFetch } from './backend';

vi.mock('@/lib/api/clientIp', () => ({
  forwardedClientHeaders: vi.fn(async () => ({
    'x-missionapp-bff-secret': 'segredo',
    'x-missionapp-client-ip': '203.0.113.9',
  })),
}));

const fetchMock = vi.fn();

describe('backendFetch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { ok: true } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('sends the forwarded client IP headers, the bearer token and the JSON body', async () => {
    await expect(
      backendFetch('/account/profile', { method: 'PATCH', body: { a: 1 }, accessToken: 'tok' })
    ).resolves.toEqual({ data: { ok: true } });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/v1\/account\/profile$/);
    expect(init.method).toBe('PATCH');
    expect(init.body).toBe('{"a":1}');
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer tok',
      'x-client-type': 'web',
      'x-missionapp-bff-secret': 'segredo',
      'x-missionapp-client-ip': '203.0.113.9',
    });
  });

  it('throws BackendApiError with the status and body on failure', async () => {
    fetchMock.mockResolvedValue(new Response('Unauthorized access', { status: 401 }));

    const error = await backendFetch('/account/profile').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(BackendApiError);
    expect(error).toMatchObject({ status: 401, body: 'Unauthorized access' });
  });

  it('uses the backend { message } when the error body has one', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Nome de usuário já está em uso' }), {
        status: 422,
        headers: { 'content-type': 'application/json' },
      })
    );

    await expect(backendFetch('/account/profile')).rejects.toMatchObject({
      message: 'Nome de usuário já está em uso',
      status: 422,
    });
  });

  it('falls back to a status message when the error body has no message', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ errors: [] }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      })
    );

    await expect(backendFetch('/x')).rejects.toMatchObject({ message: 'Erro na API (500)' });
  });

  it('defaults to GET without a body or Authorization and accepts paths without a slash', async () => {
    fetchMock.mockResolvedValue(new Response('ok', { status: 200 }));

    await expect(backendFetch('auth/sessions')).resolves.toBe('ok');

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/v1\/auth\/sessions$/);
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
    expect(init.cache).toBe('no-store');
    expect(init.headers).not.toHaveProperty('Authorization');
    expect(init.headers).toMatchObject({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  });

  it('lets callers add headers', async () => {
    await backendFetch('/x', { headers: { 'x-client-type': 'mobile' } });

    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({ 'x-client-type': 'mobile' });
  });
});
