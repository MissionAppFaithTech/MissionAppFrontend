import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/catalogSearch', () => ({
  searchCatalogCached: vi.fn(async () => ({
    items: [{ id: 'x-1', name: 'Item' }],
    hasMore: false,
  })),
}));

import { searchCatalogCached } from '@/lib/server/catalogSearch';
import { GET } from './route';

describe('/api/missionary-agencies', () => {
  it('searches the missionaryAgencies catalog without a session', async () => {
    const response = await GET(new Request('http://localhost/api/missionary-agencies?search=it'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: [{ id: 'x-1', name: 'Item' }],
      meta: { hasMore: false },
    });
    expect(searchCatalogCached).toHaveBeenCalledWith('missionaryAgencies', 'it', 10);
  });
});
