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

describe('/api/faith-communities', () => {
  beforeEach(() => {
    vi.mocked(backendFetch).mockReset();
    cookiesGet.mockReset();
    cookiesGet.mockImplementation((name: string) =>
      name === AUTH_COOKIE.accessToken ? { value: 'access-token' } : undefined
    );
  });

  it('normalizes the backend list for the select', async () => {
    vi.mocked(backendFetch).mockResolvedValue({
      data: { faithCommunities: [{ id: 'community-1', name: 'Igreja Batista' }] },
    });

    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: [{ id: 'community-1', name: 'Igreja Batista' }],
    });
  });

  it('forwards a create payload to the backend', async () => {
    vi.mocked(backendFetch).mockResolvedValue({
      data: { faithCommunity: { id: 'community-2', name: 'Igreja Nova' } },
    });

    const response = await POST(
      new Request('http://localhost:3000/api/faith-communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Igreja Nova', city: 'Niterói' }),
      })
    );

    expect(response.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledWith('/faith-communities', {
      method: 'POST',
      body: expect.objectContaining({ name: 'Igreja Nova' }),
      accessToken: 'access-token',
    });
  });
});
