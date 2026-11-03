'use client';

import { queryOptions, useQuery } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/client';
import { queryKeys, type CatalogKind } from '@/lib/query/keys';
import {
  listFaithCommunities,
  listMissionaryAgencies,
  type CatalogItem,
} from '@/services/catalog.service';

/** The backend allows 20 catalog reads per minute per IP: keep the lists for 5 minutes. */
export const CATALOG_STALE_TIME_MS = 5 * 60_000;

// Resolved on call: catalog.service also imports this module.
const LOADERS: Record<CatalogKind, () => Promise<CatalogItem[]>> = {
  missionaryAgencies: () => listMissionaryAgencies(),
  faithCommunities: () => listFaithCommunities(),
};

export function catalogQuery(kind: CatalogKind) {
  return queryOptions({
    queryKey: queryKeys.catalog(kind),
    queryFn: LOADERS[kind],
    staleTime: CATALOG_STALE_TIME_MS,
  });
}

/** Options of a sign-up select, shared by every step that lists the same catalog. */
export function useCatalogItems(kind: CatalogKind) {
  const query = useQuery(catalogQuery(kind));
  return {
    items: query.data ?? [],
    isLoading: query.isPending,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : 'Não foi possível carregar as opções'
      : null,
  };
}

/** Shows an item just created through a Server Action without listing again. */
export function addCatalogItem(kind: CatalogKind, item: CatalogItem) {
  getQueryClient().setQueryData(catalogQuery(kind).queryKey, (items) =>
    items ? [...items.filter((existing) => existing.id !== item.id), item] : items
  );
}
