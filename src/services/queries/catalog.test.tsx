import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { getQueryClient } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';
import { searchCatalog } from '@/services/catalog.service';
import { createQueryWrapper, createTestQueryClient } from '@/test/query';
import {
  CATALOG_SEARCH_DEBOUNCE_MS,
  CATALOG_STALE_TIME_MS,
  catalogSearchQuery,
  invalidateCatalogSearches,
  useCatalogSearch,
} from './catalog';

vi.mock('@/services/catalog.service', () => ({ searchCatalog: vi.fn() }));

const agencies = [{ id: 'a-1', name: 'Missão Ágape' }];

function renderSearch(initial: string) {
  const client = createTestQueryClient();
  const view = renderHook(({ input }) => useCatalogSearch('missionaryAgencies', input), {
    initialProps: { input: initial },
    wrapper: createQueryWrapper(client),
  });
  return { client, ...view };
}

async function passDebounce() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(CATALOG_SEARCH_DEBOUNCE_MS);
  });
}

describe('useCatalogSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(searchCatalog).mockReset();
    vi.mocked(searchCatalog).mockResolvedValue({ items: agencies, hasMore: false });
  });
  afterEach(() => vi.useRealTimers());

  it('does not search under two letters', async () => {
    const { result } = renderSearch(' m ');
    await passDebounce();

    expect(result.current.status).toBe('short');
    expect(result.current.items).toEqual([]);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isSearching).toBe(false);
    expect(searchCatalog).not.toHaveBeenCalled();
  });

  it('searches the normalized term once the user stops typing', async () => {
    const { result, rerender } = renderSearch('');
    rerender({ input: 'Mi' });
    rerender({ input: 'Missõ' });
    rerender({ input: 'MISSÕES' });

    expect(result.current.status).toBe('short');
    await passDebounce();
    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(searchCatalog).toHaveBeenCalledTimes(1);
    expect(searchCatalog).toHaveBeenCalledWith('missionaryAgencies', 'missoes', {
      signal: expect.any(AbortSignal),
    });
    expect(result.current.term).toBe('missoes');
    expect(result.current.items).toEqual(agencies);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('shows loading while typing and keeps the previous results listed', async () => {
    const { result, rerender } = renderSearch('missoes');
    await passDebounce();
    await waitFor(() => expect(result.current.status).toBe('ready'));

    rerender({ input: 'missoes ag' });

    expect(result.current.status).toBe('loading');
    expect(result.current.isSearching).toBe(true);
    expect(result.current.items).toEqual(agencies);

    vi.mocked(searchCatalog).mockResolvedValue({ items: [], hasMore: false });
    await passDebounce();
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.items).toEqual([]);
  });

  it('aborts the search the user typed past', async () => {
    const signals: AbortSignal[] = [];
    vi.mocked(searchCatalog).mockImplementation(
      (_kind, _term, options) =>
        new Promise((resolve) => {
          signals.push(options!.signal!);
          options!.signal!.addEventListener('abort', () => resolve({ items: [], hasMore: false }));
        })
    );
    const { rerender } = renderSearch('jo');
    await passDebounce();
    await waitFor(() => expect(signals).toHaveLength(1));

    rerender({ input: 'jocum' });
    await passDebounce();

    await waitFor(() => expect(signals).toHaveLength(2));
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  it('reports hasMore from the server page, and drops it when the term gets too short', async () => {
    vi.mocked(searchCatalog).mockResolvedValue({ items: agencies, hasMore: true });
    const { result, rerender } = renderSearch('mi');
    await passDebounce();
    await waitFor(() => expect(result.current.hasMore).toBe(true));

    rerender({ input: 'm' });
    await passDebounce();

    expect(result.current.status).toBe('short');
    expect(result.current.hasMore).toBe(false);
    expect(result.current.items).toEqual([]);
  });

  it('reports no more results when the server page is the last one', async () => {
    const { result } = renderSearch('mi');
    await passDebounce();

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.hasMore).toBe(false);
  });

  it('reports a failed search with its message and retries on demand', async () => {
    vi.mocked(searchCatalog).mockRejectedValueOnce(new ApiError('Muitas buscas seguidas.', 429));
    const { result } = renderSearch('jocum');
    await passDebounce();

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe('Muitas buscas seguidas.');

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(searchCatalog).toHaveBeenCalledTimes(2);
  });

  it('reuses a cached term without asking the server again', async () => {
    const { result, rerender } = renderSearch('missoes');
    await passDebounce();
    await waitFor(() => expect(result.current.status).toBe('ready'));

    rerender({ input: 'jo' });
    await passDebounce();
    await waitFor(() => expect(searchCatalog).toHaveBeenCalledTimes(2));
    rerender({ input: 'Missões' });
    await passDebounce();

    await waitFor(() => expect(result.current.items).toEqual(agencies));
    expect(searchCatalog).toHaveBeenCalledTimes(2);
  });
});

describe('catalogSearchQuery', () => {
  it('keeps a search fresh for five minutes, keyed by catalog and term', () => {
    const options = catalogSearchQuery('faithCommunities', 'igreja');

    expect(options.queryKey).toEqual(queryKeys.catalogSearch('faithCommunities', 'igreja'));
    expect(options.staleTime).toBe(CATALOG_STALE_TIME_MS);
    expect(CATALOG_STALE_TIME_MS).toBe(5 * 60_000);
  });
});

describe('invalidateCatalogSearches', () => {
  it('invalidates every search of that catalog only', () => {
    const client = getQueryClient();
    client.setQueryData(queryKeys.catalogSearch('missionaryAgencies', 'jo'), { items: [] });
    client.setQueryData(queryKeys.catalogSearch('faithCommunities', 'ig'), { items: [] });

    invalidateCatalogSearches('missionaryAgencies');

    expect(
      client.getQueryState(queryKeys.catalogSearch('missionaryAgencies', 'jo'))?.isInvalidated
    ).toBe(true);
    expect(
      client.getQueryState(queryKeys.catalogSearch('faithCommunities', 'ig'))?.isInvalidated
    ).toBe(false);
  });
});
