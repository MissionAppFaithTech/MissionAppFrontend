'use client';

import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { CATALOG_SEARCH_MIN_LENGTH, normalizeCatalogTerm } from '@/lib/catalog/search';
import { getQueryClient } from '@/lib/query/client';
import { queryKeys, type CatalogKind } from '@/lib/query/keys';
import { searchCatalog, type CatalogItem } from '@/services/catalog.service';

/** Catalogs change rarely; a search result stays fresh for 5 minutes. */
export const CATALOG_STALE_TIME_MS = 5 * 60_000;
/** Pause in typing before a search starts. */
export const CATALOG_SEARCH_DEBOUNCE_MS = 300;

export function catalogSearchQuery(kind: CatalogKind, term: string) {
  return queryOptions({
    queryKey: queryKeys.catalogSearch(kind, term),
    // NOTE: the query cache aborts the request (signal) when the term changes
    queryFn: ({ signal }) => searchCatalog(kind, term, { signal }),
    staleTime: CATALOG_STALE_TIME_MS,
  });
}

export type CatalogSearchStatus = 'short' | 'loading' | 'ready' | 'error';

/**
 * Autocomplete search of a catalog (backend ADR-0041):
 * - waits {@link CATALOG_SEARCH_DEBOUNCE_MS} after the last keystroke;
 * - searches from {@link CATALOG_SEARCH_MIN_LENGTH} letters, by the normalized
 *   term, so "Missões" and "missoes" share the cached result;
 * - keeps the previous results on screen while the next ones load.
 */
export function useCatalogSearch(kind: CatalogKind, input: string) {
  const term = normalizeCatalogTerm(useDebouncedValue(input, CATALOG_SEARCH_DEBOUNCE_MS));
  const enabled = term.length >= CATALOG_SEARCH_MIN_LENGTH;
  const query = useQuery({
    ...catalogSearchQuery(kind, term),
    enabled,
    placeholderData: keepPreviousData,
  });
  const typing = normalizeCatalogTerm(input) !== term;

  const status: CatalogSearchStatus = !enabled
    ? 'short'
    : query.isError
      ? 'error'
      : // NOTE: results of the previous term stay listed, but are not "the" answer yet
        query.isPending || typing || query.isPlaceholderData
        ? 'loading'
        : 'ready';

  return {
    term,
    items: (enabled ? query.data?.items : undefined) ?? ([] as CatalogItem[]),
    hasMore: enabled && query.data?.hasMore === true,
    status,
    /** Still fetching or waiting for the user to stop typing. */
    isSearching: enabled && (query.isFetching || typing),
    error: query.error instanceof Error ? query.error.message : null,
    retry: () => void query.refetch(),
  };
}

/** After an item is created, the next search of that catalog must include it. */
export function invalidateCatalogSearches(kind: CatalogKind) {
  void getQueryClient().invalidateQueries({ queryKey: queryKeys.catalogSearches(kind) });
}
