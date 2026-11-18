import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { GET as show } from './[id]/route';
import { clearRefreshCache } from '@/lib/api/bff';
import { backendMock, mockBackend, resetActionHarness, setSession } from '@/test/actionHarness';
import { POST_ID, MISSIONARY_ID, postFixture } from '@/test/posts';
vi.mock('next/headers', async () => (await import('@/test/actionHarness')).headersMock);
vi.mock('@/lib/api/backend', async () => (await import('@/test/actionHarness')).backendMock);
beforeEach(() => {
  resetActionHarness();
  clearRefreshCache();
});
describe('post BFF reads', () => {
  it('forwards owner filter/cursor/limit and serializes the real response', async () => {
    const envelope = {
      data: { posts: [postFixture] },
      meta: { nextCursor: 'next', hasMore: true },
    };
    mockBackend({
      [`GET /posts?missionaryId=${MISSIONARY_ID}&cursor=opaque&limit=20`]: () => envelope,
      [`GET /posts/${POST_ID}`]: () => ({ data: { post: postFixture } }),
    });
    expect(
      await (
        await GET(
          new Request(
            `http://localhost/api/posts?missionaryId=${MISSIONARY_ID}&cursor=opaque&limit=20`
          )
        )
      ).json()
    ).toEqual(envelope);
    expect(
      await (
        await show(new Request('http://localhost'), { params: Promise.resolve({ id: POST_ID }) })
      ).json()
    ).toEqual({ data: { post: postFixture } });
  });
  it('rejects invalid pagination and unauthenticated reads', async () => {
    expect((await GET(new Request('http://localhost/api/posts?limit=21'))).status).toBe(422);
    setSession();
    expect((await GET(new Request('http://localhost/api/posts'))).status).toBe(401);
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });
});
