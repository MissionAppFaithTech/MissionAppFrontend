import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ cacheTag: vi.fn(), cacheLife: vi.fn() }));
vi.mock('@/lib/api/public', () => ({ publicBackendFetch: vi.fn() }));

import { cacheLife, cacheTag } from 'next/cache';
import { publicBackendFetch } from '@/lib/api/public';
import { searchCatalogCached } from './catalogSearch';

describe('searchCatalogCached', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reads one page of the catalog as the BFF server, tagged for updateTag', async () => {
    vi.mocked(publicBackendFetch).mockResolvedValue({
      data: { faithCommunities: [{ id: 'c-1', name: 'Igreja da Paz', city: 'Niterói' }] },
      meta: { hasMore: true },
    });

    await expect(searchCatalogCached('faithCommunities', 'igreja paz', 10)).resolves.toEqual({
      items: [{ id: 'c-1', name: 'Igreja da Paz' }],
      hasMore: true,
    });
    expect(publicBackendFetch).toHaveBeenCalledWith(
      '/faith-communities?search=igreja+paz&limit=10'
    );
    expect(cacheTag).toHaveBeenCalledWith('catalog:faithCommunities');
    expect(cacheLife).toHaveBeenCalledWith('catalog');
  });

  it('treats an odd meta as the last page', async () => {
    vi.mocked(publicBackendFetch).mockResolvedValue({
      data: { missionaryAgencies: [{ id: 'a-1', name: 'JOCUM' }] },
      meta: { hasMore: 'yes' },
    });

    await expect(searchCatalogCached('missionaryAgencies', 'jo', 5)).resolves.toEqual({
      items: [{ id: 'a-1', name: 'JOCUM' }],
      hasMore: false,
    });
    expect(publicBackendFetch).toHaveBeenCalledWith('/missionary-agencies?search=jo&limit=5');
  });

  it('treats a body without meta as the last page', async () => {
    vi.mocked(publicBackendFetch).mockResolvedValue({ data: { missionaryAgencies: [] } });

    await expect(searchCatalogCached('missionaryAgencies', 'jo', 10)).resolves.toEqual({
      items: [],
      hasMore: false,
    });
  });
});
