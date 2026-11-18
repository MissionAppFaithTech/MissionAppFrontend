import { renderHook, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { createQueryWrapper, createTestQueryClient } from '@/test/query';
import { MISSIONARY_ID, IMAGE_ID, postFixture } from '@/test/posts';
import { queryKeys } from '@/lib/query/keys';
import { listPosts } from '@/services/post.service';
import { usePosts } from './posts';
vi.mock('@/services/post.service', () => ({ listPosts: vi.fn() }));

it('refreshes processing images even after many previous updates of the same feed', async () => {
  const client = createTestQueryClient();
  const page = { data: { posts: [postFixture] }, meta: { hasMore: false, nextCursor: null } };
  for (let i = 0; i < 21; i++)
    client.setQueryData(queryKeys.postFeed(MISSIONARY_ID, MISSIONARY_ID), {
      pages: [page],
      pageParams: [undefined],
    });
  const processing = {
    ...postFixture,
    images: [
      {
        id: IMAGE_ID,
        imageAssetId: IMAGE_ID,
        order: 0,
        createdAt: postFixture.createdAt,
        image: { id: IMAGE_ID, status: 'PROCESSING' as const, url: null },
      },
    ],
  };
  const ready = {
    ...processing,
    images: [
      {
        ...processing.images[0],
        image: { id: IMAGE_ID, status: 'READY' as const, url: 'https://storage.test/image.webp' },
      },
    ],
  };
  vi.mocked(listPosts)
    .mockResolvedValueOnce({ ...page, data: { posts: [processing] } })
    .mockResolvedValue({ ...page, data: { posts: [ready] } });
  const { result, unmount } = renderHook(() => usePosts(MISSIONARY_ID, MISSIONARY_ID), {
    wrapper: createQueryWrapper(client),
  });
  await waitFor(() =>
    expect(result.current.data?.pages[0].data.posts[0].images[0]?.image.status).toBe('PROCESSING')
  );
  await waitFor(
    () => expect(result.current.data?.pages[0].data.posts[0].images[0]?.image.status).toBe('READY'),
    { timeout: 5000 }
  );
  unmount();
});
