import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH } from './route.account-profile';
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

describe('GET /api/account/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no accessToken is present', async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.message).toBe('Não autenticado');
  });

  it('calls backend GET /account/profile and returns user profile', async () => {
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === AUTH_COOKIE.accessToken) return { value: 'valid-token' };
      return undefined;
    });

    const mockProfileResponse = {
      user: {
        id: 'usr-1',
        fullName: 'Pr. Carlos Oliveira',
        username: 'pr_carlos',
        email: 'carlos@example.com',
        biography: 'Plantador de igrejas no sertão',
        role: 'MISSIONARY',
      },
      missionary: {
        id: '018f0000-0000-7000-8000-000000000001',
        aboutMe: 'Chamado para o Nordeste',
        originLocation: 'Recife/PE',
      },
      workAddress: {
        city: 'Juazeiro',
        state: 'BA',
      },
    };

    vi.mocked(backendFetch).mockResolvedValue({ data: mockProfileResponse });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledWith('/account/profile', {
      method: 'GET',
      accessToken: 'valid-token',
    });
    expect(data.data.user.username).toBe('pr_carlos');
    expect(data.data.missionary.aboutMe).toBe('Chamado para o Nordeste');
  });

  it('returns backend error status when backendFetch throws BackendApiError', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'token-abc' });
    vi.mocked(backendFetch).mockRejectedValue(
      new BackendApiError('Sessão expirada', 401, { message: 'Sessão expirada' })
    );

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.message).toBe('Sessão expirada');
  });
});

describe('PATCH /api/account/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no accessToken is present', async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const req = new Request('http://localhost:3000/api/account/profile', {
      method: 'PATCH',
      body: JSON.stringify({ fullName: 'Novo Nome' }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it('validates payload and updates account profile via backend', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'token-valid' });
    vi.mocked(backendFetch).mockResolvedValue({
      data: {
        user: { id: 'usr-1', fullName: 'Carlos Silva', biography: 'Nova bio' },
      },
    });

    const req = new Request('http://localhost:3000/api/account/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        fullName: 'Carlos Silva',
        username: 'carlossilva',
        biography: 'Nova bio',
      }),
    });

    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledWith(
      '/account/profile',
      expect.objectContaining({
        method: 'PATCH',
        accessToken: 'token-valid',
        body: expect.objectContaining({
          fullName: 'Carlos Silva',
          username: 'carlossilva',
          biography: 'Nova bio',
        }),
      })
    );
    expect(data.data.user.fullName).toBe('Carlos Silva');
  });
});
