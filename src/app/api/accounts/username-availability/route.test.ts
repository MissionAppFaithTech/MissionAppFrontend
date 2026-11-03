import { beforeEach, describe, it, expect, vi } from 'vitest';
import { GET } from './route';
import { BackendApiError, backendFetch } from '@/lib/api/backend';

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

const mockedFetch = vi.mocked(backendFetch);

const get = (username: string) =>
  GET(
    new Request(
      `http://localhost:3000/api/accounts/username-availability?username=${encodeURIComponent(username)}`
    )
  );

describe('GET /api/accounts/username-availability', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
  });

  it('returns 422 for invalid username with special characters or too short', async () => {
    const res = await get('ab');
    expect(res.status).toBe(422);
    expect((await res.json()).message).toContain('Nome de usuário inválido');
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('normalizes a valid username and returns the backend answer', async () => {
    const answer = { data: { available: true, username: 'valid_user_123', suggestions: [] } };
    mockedFetch.mockResolvedValue(answer);
    const res = await get('  Valid_User_123 ');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(answer);
    expect(mockedFetch).toHaveBeenCalledWith(
      '/accounts/username-availability?username=valid_user_123'
    );
  });

  it('passes the rate limit through', async () => {
    mockedFetch.mockRejectedValue(new BackendApiError('Too many', 429, { message: 'Too many' }));
    const res = await get('valid_user_123');
    expect(res.status).toBe(429);
  });

  it('answers 502 when the backend is unreachable', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedFetch.mockRejectedValue(new TypeError('fetch failed'));
    const res = await get('valid_user_123');
    expect(res.status).toBe(502);
    error.mockRestore();
  });
});
