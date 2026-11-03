import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { getQueryClient } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';
import { listFaithCommunities, listMissionaryAgencies } from '@/services/catalog.service';
import { createQueryWrapper } from '@/test/query';
import { CATALOG_STALE_TIME_MS, addCatalogItem, catalogQuery, useCatalogItems } from './catalog';

vi.mock('@/services/catalog.service', () => ({
  listFaithCommunities: vi.fn(),
  listMissionaryAgencies: vi.fn(),
}));

const communities = [{ id: 'fc-1', name: 'Igreja Batista Central' }];

describe('useCatalogItems', () => {
  beforeEach(() => {
    vi.mocked(listFaithCommunities).mockReset();
    vi.mocked(listMissionaryAgencies).mockReset();
  });

  it('loads the list once for every step that shows it', async () => {
    vi.mocked(listFaithCommunities).mockResolvedValue(communities);
    const wrapper = createQueryWrapper();

    const first = renderHook(() => useCatalogItems('faithCommunities'), { wrapper });
    const second = renderHook(() => useCatalogItems('faithCommunities'), { wrapper });

    expect(first.result.current).toEqual({ items: [], isLoading: true, error: null });
    await waitFor(() => expect(first.result.current.items).toEqual(communities));
    await waitFor(() => expect(second.result.current.items).toEqual(communities));
    expect(listFaithCommunities).toHaveBeenCalledTimes(1);
    expect(listMissionaryAgencies).not.toHaveBeenCalled();
  });

  it('reports a failed load with its message', async () => {
    vi.mocked(listMissionaryAgencies).mockRejectedValue(
      new ApiError('Muitas tentativas. Aguarde 1 minuto.', 429)
    );

    const { result } = renderHook(() => useCatalogItems('missionaryAgencies'), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() =>
      expect(result.current).toEqual({
        items: [],
        isLoading: false,
        error: 'Muitas tentativas. Aguarde 1 minuto.',
      })
    );
  });

  it('keeps catalogs for five minutes because of the backend rate limit', () => {
    expect(catalogQuery('faithCommunities').staleTime).toBe(CATALOG_STALE_TIME_MS);
    expect(CATALOG_STALE_TIME_MS).toBe(300_000);
  });
});

describe('addCatalogItem', () => {
  beforeEach(() => {
    getQueryClient().clear();
  });

  it('appends a created item to a loaded list, without duplicates', () => {
    const client = getQueryClient();
    client.setQueryData(queryKeys.catalog('faithCommunities'), communities);

    act(() => {
      addCatalogItem('faithCommunities', { id: 'fc-2', name: 'Igreja Nova' });
      addCatalogItem('faithCommunities', { id: 'fc-2', name: 'Igreja Nova' });
    });

    expect(client.getQueryData(queryKeys.catalog('faithCommunities'))).toEqual([
      ...communities,
      { id: 'fc-2', name: 'Igreja Nova' },
    ]);
  });

  it('leaves a list that was never loaded alone', () => {
    addCatalogItem('missionaryAgencies', { id: 'ag-1', name: 'JMN' });

    expect(getQueryClient().getQueryData(queryKeys.catalog('missionaryAgencies'))).toBeUndefined();
  });
});
