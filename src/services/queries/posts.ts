'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { listPosts } from '@/services/post.service';

export function usePosts(ownerId: string, missionaryId?: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.postFeed(ownerId, missionaryId),
    queryFn: ({ pageParam }) => listPosts({ missionaryId, cursor: pageParam, limit: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.meta.hasMore ? (last.meta.nextCursor ?? undefined) : undefined,
    enabled: Boolean(ownerId),
    // Refresh processing images without delaying publication. TanStack pauses
    // polling in background tabs and stops it when every asset is ready/failed.
    refetchInterval: (query) =>
      query.state.data?.pages.some((page) =>
        page.data.posts.some((post) =>
          post.images.some(({ image }) => image.status === 'PROCESSING')
        )
      )
        ? 3000
        : false,
  });
}
