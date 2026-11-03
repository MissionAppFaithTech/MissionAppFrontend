import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_COOKIE } from '@/lib/auth/cookies';
import { ANONYMOUS_SESSION } from '@/lib/auth/session';

let cookieValue: string | undefined;
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      name === AUTH_COOKIE.accessToken && cookieValue !== undefined
        ? { name, value: cookieValue }
        : undefined,
  })),
}));

const token = (claims: object) =>
  `header.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`;

async function readSession() {
  // `cache` keeps one value per module instance, so each case loads a fresh one.
  vi.resetModules();
  const { getCurrentUser } = await import('./session');
  return getCurrentUser();
}

describe('getCurrentUser', () => {
  beforeEach(() => {
    cookieValue = undefined;
  });

  it('is anonymous without an access cookie', async () => {
    await expect(readSession()).resolves.toEqual(ANONYMOUS_SESSION);
  });

  it('is anonymous when the token cannot be read or has no subject', async () => {
    cookieValue = 'not-a-jwt';
    await expect(readSession()).resolves.toEqual(ANONYMOUS_SESSION);

    cookieValue = token({ role: 'MISSIONARY' });
    await expect(readSession()).resolves.toEqual(ANONYMOUS_SESSION);
  });

  it('returns the user id and role from the token', async () => {
    cookieValue = token({ sub: 'user-1', role: 'SUPPORTER' });

    await expect(readSession()).resolves.toEqual({
      status: 'authenticated',
      userId: 'user-1',
      role: 'SUPPORTER',
    });
  });

  it('keeps the session but drops a role the app does not know', async () => {
    cookieValue = token({ sub: 'user-1', role: 'ROOT' });

    await expect(readSession()).resolves.toEqual({
      status: 'authenticated',
      userId: 'user-1',
      role: null,
    });
  });
});
