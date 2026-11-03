import { beforeEach, describe, it, expect, vi } from 'vitest';
import { POST } from './route';
import { BackendApiError, backendFetch } from '@/lib/api/backend';

// Never reach a real backend: the dev mailer sends real e-mails.
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

function post(body: string) {
  return POST(
    new Request('http://localhost:3000/api/auth/forgot-password', { method: 'POST', body })
  );
}

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
  });

  it('returns 400 for invalid json', async () => {
    const res = await post('invalid-json');
    expect(res.status).toBe(400);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('returns 422 for invalid email', async () => {
    const res = await post(JSON.stringify({ login: 'not-an-email' }));
    expect(res.status).toBe(422);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('forwards a valid email and returns the confirmation message', async () => {
    mockedFetch.mockResolvedValue(null as never);
    const res = await post(JSON.stringify({ login: 'valid@example.com' }));
    expect(res.status).toBe(200);
    expect(mockedFetch).toHaveBeenCalledWith('/auth/forgot-password', {
      method: 'POST',
      body: { login: 'valid@example.com' },
    });
    const body = await res.json();
    expect(body.message).toContain('instruções');
  });

  it('keeps the generic answer when the backend is unreachable', async () => {
    mockedFetch.mockRejectedValue(new TypeError('fetch failed'));
    const res = await post(JSON.stringify({ login: 'valid@example.com' }));
    expect(res.status).toBe(200);
    expect((await res.json()).message).toContain('instruções');
  });

  it('passes backend errors through', async () => {
    mockedFetch.mockRejectedValue(new BackendApiError('Too many', 429, { message: 'Too many' }));
    const res = await post(JSON.stringify({ login: 'valid@example.com' }));
    expect(res.status).toBe(429);
  });
});
