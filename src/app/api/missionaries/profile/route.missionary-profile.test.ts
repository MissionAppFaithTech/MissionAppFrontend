import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH, POST } from './route.missionary-profile';
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

describe('PATCH /api/missionaries/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const req = new Request('http://localhost:3000/api/missionaries/profile', {
      method: 'PATCH',
      body: JSON.stringify({ publicEmail: 'carlos@example.com' }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it('updates public contact via backend /missionaries/profile', async () => {
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === AUTH_COOKIE.accessToken) return { value: 'tok-456' };
      return undefined;
    });

    vi.mocked(backendFetch).mockResolvedValue({
      data: { missionary: { id: 'm-2' } },
    });

    const req = new Request('http://localhost:3000/api/missionaries/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        publicEmail: 'contato@carlos.com',
        publicPhone: '+5511999999999',
      }),
    });

    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledWith(
      '/missionaries/profile',
      expect.objectContaining({
        method: 'PATCH',
        accessToken: 'tok-456',
        body: {
          publicEmail: 'contato@carlos.com',
          publicPhone: '+5511999999999',
        },
      })
    );
    expect(data.data.missionary.id).toBe('m-2');
  });

  it('handles BackendApiError appropriately', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'tok-err' });
    vi.mocked(backendFetch).mockRejectedValue(
      new BackendApiError('Erro no backend', 422, { message: 'Erro no backend' })
    );

    const req = new Request('http://localhost:3000/api/missionaries/profile', {
      method: 'PATCH',
      body: JSON.stringify({ publicEmail: 'email@valido.com' }),
    });

    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(422);
    expect(data.message).toBe('Erro no backend');
  });
});

describe('POST /api/missionaries/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const req = new Request('http://localhost:3000/api/missionaries/profile', {
      method: 'POST',
      body: JSON.stringify({ missionaryAgencyId: '018f1111-2222-7333-8444-555555555555' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('creates missionary profile via backend /missionaries/profile', async () => {
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === AUTH_COOKIE.accessToken) return { value: 'tok-post' };
      return undefined;
    });

    vi.mocked(backendFetch).mockResolvedValue({
      data: { missionary: { id: 'm-created' } },
    });

    const req = new Request('http://localhost:3000/api/missionaries/profile', {
      method: 'POST',
      body: JSON.stringify({
        missionaryAgencyId: '018f1111-2222-7333-8444-555555555555',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledWith(
      '/missionaries/profile',
      expect.objectContaining({
        method: 'POST',
        accessToken: 'tok-post',
        body: {
          missionaryAgencyId: '018f1111-2222-7333-8444-555555555555',
        },
      })
    );
    expect(data.data.missionary.id).toBe('m-created');
  });
});
