import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { BackendApiError } from '@/lib/api/backend';
import { publicBackendFetch } from './public';

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => {
    throw new Error('public reads must not touch cookies');
  }),
  headers: vi.fn(() => {
    throw new Error('public reads must not touch request headers');
  }),
}));

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('publicBackendFetch', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    vi.stubEnv('API_URL', 'http://api.test');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('calls the API anonymously and returns the JSON body', async () => {
    vi.stubEnv('BFF_SHARED_SECRET', '');
    fetchSpy.mockResolvedValue(json({ data: { ok: true } }));

    await expect(publicBackendFetch('/public/missionaries/ana')).resolves.toEqual({
      data: { ok: true },
    });
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('http://api.test/api/v1/public/missionaries/ana');
    const headers = init?.headers as Record<string, string>;
    expect(headers).not.toHaveProperty('Authorization');
    expect(headers).not.toHaveProperty('x-missionapp-bff-secret');
  });

  it('sends the BFF secret without a client IP, for the server budget (backend ADR-0036)', async () => {
    vi.stubEnv('BFF_SHARED_SECRET', 'segredo');
    fetchSpy.mockResolvedValue(json({ data: {} }));

    await publicBackendFetch('/public/missionaries/ana');

    const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['x-missionapp-bff-secret']).toBe('segredo');
    expect(headers).not.toHaveProperty('x-missionapp-client-ip');
  });

  it('throws a BackendApiError with the status and body', async () => {
    fetchSpy.mockResolvedValue(json({ message: 'Not found', code: 'E_NOT_FOUND' }, 404));

    const error = await publicBackendFetch('/x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(BackendApiError);
    expect(error).toMatchObject({
      status: 404,
      message: 'Not found',
      body: { code: 'E_NOT_FOUND' },
    });
  });

  it('reports a non-JSON failure by its status', async () => {
    fetchSpy.mockResolvedValue(new Response('Bad gateway', { status: 502 }));

    await expect(publicBackendFetch('/x')).rejects.toMatchObject({
      status: 502,
      message: 'Erro na API (502)',
      body: 'Bad gateway',
    });
  });
});
