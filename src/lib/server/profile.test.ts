import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAccountProfile } from '@/lib/api/accountProfile';
import { BackendApiError } from '@/lib/api/backend';
import { AUTH_COOKIE } from '@/lib/auth/cookies';
import { loadMyProfile } from './profile';

let accessToken: string | undefined;
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      name === AUTH_COOKIE.accessToken && accessToken ? { name, value: accessToken } : undefined,
  })),
}));

vi.mock('@/lib/api/accountProfile', () => ({ fetchAccountProfile: vi.fn() }));

const payload = {
  user: {
    id: 'user-1',
    fullName: 'Ana Souza',
    username: 'ana',
    email: 'ana@example.com',
    role: 'MISSIONARY',
  },
  missionary: null,
  workAddress: null,
};

describe('loadMyProfile', () => {
  beforeEach(() => {
    accessToken = 'access-token';
    vi.mocked(fetchAccountProfile).mockReset();
  });

  it('reports a logged-out visitor without calling the API', async () => {
    accessToken = undefined;

    await expect(loadMyProfile()).resolves.toEqual({ kind: 'anonymous' });
    expect(fetchAccountProfile).not.toHaveBeenCalled();
  });

  it('maps the account payload into the profile with the access token', async () => {
    vi.mocked(fetchAccountProfile).mockResolvedValue(payload as never);

    const result = await loadMyProfile();

    expect(fetchAccountProfile).toHaveBeenCalledWith('access-token');
    expect(result.kind).toBe('ok');
    expect(result.kind === 'ok' && result.profile).toMatchObject({
      username: 'ana',
      displayName: 'Ana Souza',
    });
  });

  it('treats a 401 as an ended session', async () => {
    vi.mocked(fetchAccountProfile).mockRejectedValue(new BackendApiError('Unauthorized', 401));

    await expect(loadMyProfile()).resolves.toEqual({ kind: 'expired' });
  });

  it('turns other API errors into pt-BR copy', async () => {
    vi.mocked(fetchAccountProfile).mockRejectedValue(
      new BackendApiError('Too many', 429, {
        message: 'Too many requests',
        code: 'E_TOO_MANY_REQUESTS',
        meta: { retryAfterSeconds: 60 },
      })
    );

    const result = await loadMyProfile();

    expect(result.kind).toBe('error');
    expect(result.kind === 'error' && result.message).toMatch(/tentativas|aguarde|minuto/i);
  });

  it('logs unexpected failures and shows a generic message', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fetchAccountProfile).mockRejectedValue(new TypeError('fetch failed'));

    await expect(loadMyProfile()).resolves.toEqual({
      kind: 'error',
      message: 'Não foi possível carregar o seu perfil.',
    });
    expect(consoleError).toHaveBeenCalledWith('[profile] load failed', expect.any(TypeError));
    consoleError.mockRestore();
  });
});
