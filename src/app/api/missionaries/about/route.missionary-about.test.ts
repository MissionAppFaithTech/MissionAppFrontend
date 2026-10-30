import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH } from './route.missionary-about';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { AUTH_COOKIE } from '@/lib/auth/cookies';

const mockCookieStore = {
  get: vi.fn(),
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

describe('PATCH /api/missionaries/about', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const req = new Request('http://localhost:3000/api/missionaries/about', {
      method: 'PATCH',
      body: JSON.stringify({ aboutMe: 'Olá mundo' }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it('updates about info via backend /missionaries/about', async () => {
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === AUTH_COOKIE.accessToken) return { value: 'tok-123' };
      return undefined;
    });

    vi.mocked(backendFetch).mockResolvedValue({
      data: { missionary: { id: 'm-1' } },
    });

    const req = new Request('http://localhost:3000/api/missionaries/about', {
      method: 'PATCH',
      body: JSON.stringify({
        aboutMe: 'Sobre atualizado',
        originLocation: 'Campinas/SP',
      }),
    });

    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledWith(
      '/missionaries/about',
      expect.objectContaining({
        method: 'PATCH',
        accessToken: 'tok-123',
        body: expect.objectContaining({
          aboutMe: 'Sobre atualizado',
          originLocation: 'Campinas/SP',
        }),
      })
    );
    expect(data.data.missionary.id).toBe('m-1');
  });

  it('handles BackendApiError appropriately', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'tok-err' });
    vi.mocked(backendFetch).mockRejectedValue(
      new BackendApiError('Erro no backend', 422, { message: 'Erro no backend' })
    );

    const req = new Request('http://localhost:3000/api/missionaries/about', {
      method: 'PATCH',
      body: JSON.stringify({ aboutMe: 'Texto' }),
    });

    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(422);
    expect(data.message).toBe('Erro no backend');
  });

  it('cleans empty strings and sends undefined fields to backend', async () => {
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === AUTH_COOKIE.accessToken) return { value: 'tok-123' };
      return undefined;
    });

    vi.mocked(backendFetch).mockResolvedValue({
      data: { missionary: { id: 'm-1' } },
    });

    const req = new Request('http://localhost:3000/api/missionaries/about', {
      method: 'PATCH',
      body: JSON.stringify({
        aboutMe: 'Sobre atualizado',
        originLocation: '',
        faithCommunityId: '',
        prayerRequest: '',
        lifeVerse: '',
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledWith(
      '/missionaries/about',
      expect.objectContaining({
        method: 'PATCH',
        accessToken: 'tok-123',
        body: expect.objectContaining({
          aboutMe: 'Sobre atualizado',
        }),
      })
    );
  });
});
