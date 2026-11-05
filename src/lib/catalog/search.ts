import type { CatalogKind } from '@/lib/query/keys';

/**
 * Catalog search rules shared by the browser and the BFF (backend ADR-0041).
 */

/** The backend refuses shorter terms (1 letter would match almost everything). */
export const CATALOG_SEARCH_MIN_LENGTH = 2;
/** Results per search in the autocomplete (backend default is 10, max 20). */
export const CATALOG_SEARCH_LIMIT = 10;
/** Longest term the BFF forwards; longer input is a typing accident or abuse. */
export const CATALOG_SEARCH_MAX_LENGTH = 100;

/**
 * Same normalization as the backend's `catalog_normalize`: no accents,
 * lowercase, single spaces. It is the cache key, so "Missões" and "missoes"
 * share one cached result.
 *
 * @example
 * normalizeCatalogTerm('  Missões   SÃO  ') // 'missoes sao'
 */
export function normalizeCatalogTerm(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/** Backend path and collection key of each catalog. */
export const CATALOG_API: Record<CatalogKind, { path: string; key: string }> = {
  missionaryAgencies: { path: '/missionary-agencies', key: 'missionaryAgencies' },
  faithCommunities: { path: '/faith-communities', key: 'faithCommunities' },
};
