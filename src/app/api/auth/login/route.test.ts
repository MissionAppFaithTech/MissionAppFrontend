import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { POST } from './route';
import { clearRefreshCache } from '@/lib/api/bff';

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

function post(body: unknown, raw = false) {
  return POST(
    new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: raw ? (body as string) : JSON.stringify(body),
    })
  );
}

const credentials = { login: 'user@example.com', password: 'secret12' };

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    clearRefreshCache();
    vi.mocked(backendFetch).mockReset();
  });

  it('returns 400 for invalid json', async () => {
    expect((await post('invalid-json', true)).status).toBe(400);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('returns 422 for an invalid email', async () => {
    expect((await post({ login: 'not-an-email', password: 'secret12' })).status).toBe(422);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('sets httpOnly auth cookies and returns only the user on success', async () => {
    vi.mocked(backendFetch).mockResolvedValue({
      data: {
        accessToken: 'access',
        refreshToken: 'refresh',
        user: { id: 'u1', fullName: 'User', email: credentials.login, role: 'MISSIONARY' },
      },
    });

    const res = await post(credentials);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      data: { user: { id: 'u1', fullName: 'User', email: credentials.login, role: 'MISSIONARY' } },
    });
    expect(JSON.stringify(body)).not.toContain('access');
    const cookies = res.headers.getSetCookie().join('\n');
    expect(cookies).toMatch(/ma_access_token=access;.*HttpOnly/i);
    expect(cookies).toMatch(/ma_refresh_token=refresh;.*HttpOnly/i);
  });

  it('localizes invalid credentials (backend 400)', async () => {
    vi.mocked(backendFetch).mockRejectedValue(
      new BackendApiError('Invalid', 400, { errors: [{ message: 'Invalid user credentials' }] })
    );

    const res = await post(credentials);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      message: 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
    });
  });

  it('answers 502 when the backend is unreachable', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(backendFetch).mockRejectedValue(new TypeError('fetch failed'));

    const res = await post(credentials);

    expect(res.status).toBe(502);
    consoleError.mockRestore();
  });
});
