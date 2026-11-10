import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearRefreshCache } from '@/lib/api/bff';
import { ACCESS, backendMock, mockBackend, resetActionHarness } from '@/test/actionHarness';
import { reportAction } from './report';

vi.mock('next/headers', async () => (await import('@/test/actionHarness')).headersMock);
vi.mock('next/cache', async () => (await import('@/test/actionHarness')).cacheMock);
vi.mock('@/lib/api/backend', async () => (await import('@/test/actionHarness')).backendMock);

beforeEach(() => {
  clearRefreshCache();
  resetActionHarness();
});

describe('reportAction', () => {
  it('posts a valid report with the session token', async () => {
    mockBackend({ 'POST /reports': () => ({ data: {} }) });

    await expect(
      reportAction({ targetType: 'post', targetId: 'p1', reason: 'spam' })
    ).resolves.toEqual({ ok: true, data: { reported: true } });
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/reports', {
      method: 'POST',
      body: { targetType: 'post', targetId: 'p1', reason: 'spam' },
      accessToken: ACCESS,
    });
  });

  it('requires details for "other" and caps them at 250 words', async () => {
    const base = { targetType: 'profile', targetId: 'u1', reason: 'other' } as const;
    const empty = await reportAction({ ...base });
    expect(empty.ok).toBe(false);
    const long = await reportAction({ ...base, details: Array(251).fill('a').join(' ') });
    expect(long.ok).toBe(false);
    const edge = Array(250).fill('a').join(' ');
    mockBackend({ 'POST /reports': () => ({ data: {} }) });
    expect((await reportAction({ ...base, details: edge })).ok).toBe(true);
  });

  it('rejects an unknown reason without calling the backend', async () => {
    const result = await reportAction({
      targetType: 'post',
      targetId: 'p1',
      reason: 'nope' as 'spam',
    });
    expect(result.ok).toBe(false);
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });
});
