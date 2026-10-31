import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookiesGet = vi.fn();

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: cookiesGet })),
}));

vi.mock('@/lib/api/backend', () => ({
  BackendApiError: class BackendApiError extends Error {
    constructor(
      message: string,
      public status: number,
      public body?: unknown
    ) {
      super(message);
    }
  },
  backendFetch: vi.fn(),
}));

import { backendFetch } from '@/lib/api/backend';
import { AUTH_COOKIE } from '@/lib/auth/cookies';
import { GET, POST } from './route';
import { clearRefreshCache } from '@/lib/api/bff';

describe('/api/missionary-agencies', () => {
  beforeEach(() => {
    clearRefreshCache();
    vi.mocked(backendFetch).mockReset();
    cookiesGet.mockReset();
    cookiesGet.mockImplementation((name: string) =>
      name === AUTH_COOKIE.accessToken ? { value: 'access-token' } : undefined
    );
  });

  it('normalizes the backend list for the select', async () => {
    vi.mocked(backendFetch).mockResolvedValue({
      data: { missionaryAgencies: [{ id: 'agency-1', name: 'JOCUM' }] },
    });

    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: [{ id: 'agency-1', name: 'JOCUM' }],
    });
  });

  it('returns 401 when creating without an access token', async () => {
    cookiesGet.mockReturnValue(undefined);
    const response = await POST(
      new Request('http://localhost:3000/api/missionary-agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Nova Agência' }),
      })
    );
    expect(response.status).toBe(401);
  });

  it('forwards a create payload to the backend', async () => {
    vi.mocked(backendFetch).mockResolvedValue({
      data: { missionaryAgency: { id: 'agency-2', name: 'Nova Agência' } },
    });

    const response = await POST(
      new Request('http://localhost:3000/api/missionary-agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Nova Agência',
          phoneNumber: '+5511987654321',
          country: 'Brasil',
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledWith('/missionary-agencies', {
      method: 'POST',
      body: expect.objectContaining({ name: 'Nova Agência' }),
      accessToken: 'access-token',
    });
  });

  it('lists without a session (public catalog) and sends no token', async () => {
    cookiesGet.mockReturnValue(undefined);
    vi.mocked(backendFetch).mockResolvedValue({
      data: { missionaryAgencies: [{ id: 'x-1', name: 'JOCUM' }] },
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledWith(expect.stringMatching(/^\//));
    expect(vi.mocked(backendFetch).mock.calls[0]).toHaveLength(1);
  });

  it('maps the public listing rate limit (429) to a pt-BR message', async () => {
    const { BackendApiError } = await import('@/lib/api/backend');
    vi.mocked(backendFetch).mockRejectedValue(
      new BackendApiError('Too many requests', 429, { message: 'Too many requests' })
    );

    const response = await GET();

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      message: 'Muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente.',
    });
  });
});
