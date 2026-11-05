import { cacheLife, cacheTag } from 'next/cache';
import { publicBackendFetch } from '@/lib/api/public';
import { catalogItemsFrom } from '@/lib/api/catalog';
import { catalogTag } from '@/lib/cache/tags';
import { CATALOG_API } from '@/lib/catalog/search';
import type { CatalogKind } from '@/lib/query/keys';
import type { CatalogItem } from '@/services/catalog.service';

export type CatalogSearchResult = { items: CatalogItem[]; hasMore: boolean };

/**
 * One page of a catalog search, shared by every visitor (`use cache`, life
 * `catalog`). Keyed by the normalized term, so accents and case reuse the same
 * entry; creating an item expires the catalog's tag. The read goes out as the
 * BFF server, in its own backend rate-limit budget (ADR-0041) — the BFF route
 * limits each IP before calling this.
 *
 * @param kind Catalog to search.
 * @param term Term already normalized by `normalizeCatalogTerm`.
 * @param limit Page size (1-20).
 */
export async function searchCatalogCached(
  kind: CatalogKind,
  term: string,
  limit: number
): Promise<CatalogSearchResult> {
  'use cache';
  cacheTag(catalogTag(kind));
  cacheLife('catalog');

  const { path, key } = CATALOG_API[kind];
  const query = new URLSearchParams({ search: term, limit: String(limit) });
  const payload = await publicBackendFetch<{ meta?: { hasMore?: unknown } }>(`${path}?${query}`);
  return { items: catalogItemsFrom(payload, key), hasMore: payload.meta?.hasMore === true };
}
