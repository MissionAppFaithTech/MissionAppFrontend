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
import { PATCH } from './route.missionary-id-about';

const missionaryId = '018f1a2b-3c4d-7e8f-9a0b-1c2d3e4f5a6b';

function request(body: unknown, id = missionaryId) {
  return PATCH(
    new Request(`http://localhost:3000/api/missionaries/${id}/about`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  );
}

describe('PATCH /api/missionaries/[id]/about', () => {
  beforeEach(() => {
    vi.mocked(backendFetch).mockReset();
    cookiesGet.mockReset();
    cookiesGet.mockImplementation((name: string) =>
      name === AUTH_COOKIE.accessToken ? { value: 'access-token' } : undefined
    );
  });

  it('rejects an invalid missionary id', async () => {
    const response = await request({ aboutMe: 'Texto' }, 'nao-uuid');
    expect(response.status).toBe(400);
  });

  it('returns 401 when the access token cookie is missing', async () => {
    cookiesGet.mockReturnValue(undefined);
    const response = await request({ aboutMe: 'Texto' });
    expect(response.status).toBe(401);
  });

  it('forwards a valid payload to the backend about endpoint', async () => {
    vi.mocked(backendFetch).mockResolvedValue({
      data: { missionary: { id: missionaryId } },
    });

    const response = await request({
      aboutMe: 'Sou missionário',
      lifeVerse: 'João 3:16',
    });

    expect(response.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledWith(`/missionaries/${missionaryId}/about`, {
      method: 'PATCH',
      body: { aboutMe: 'Sou missionário', lifeVerse: 'João 3:16' },
      accessToken: 'access-token',
    });
  });

  it('returns 502 when the backend is unreachable', async () => {
    vi.mocked(backendFetch).mockRejectedValue(new Error('ECONNREFUSED'));
    const response = await request({ aboutMe: 'Texto' });
    expect(response.status).toBe(502);
  });
});
