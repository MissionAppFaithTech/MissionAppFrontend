import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/catalogSearch', () => ({
  searchCatalogCached: vi.fn(async () => ({
    items: [{ id: 'x-1', name: 'Item' }],
    hasMore: false,
  })),
}));

import { searchCatalogCached } from '@/lib/server/catalogSearch';
import { GET } from './route';

describe('/api/faith-communities', () => {
  it('searches the faithCommunities catalog without a session', async () => {
    const response = await GET(new Request('http://localhost/api/faith-communities?search=it'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: [{ id: 'x-1', name: 'Item' }],
      meta: { hasMore: false },
    });
    expect(searchCatalogCached).toHaveBeenCalledWith('faithCommunities', 'it', 10);
  });
});
