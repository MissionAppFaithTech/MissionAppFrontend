/**
 * Query keys by domain (ADR-0002). Components never write keys by hand: they
 * use the hooks in `src/services/queries/`.
 */
export type CatalogKind = 'missionaryAgencies' | 'faithCommunities';

export const queryKeys = {
  usernameAvailability: (username: string) => ['username-availability', username] as const,
  /** Every search of one catalog (to invalidate after creating an item). */
  catalogSearches: (kind: CatalogKind) => ['catalog-search', kind] as const,
  /** One page of a catalog search, by normalized term. */
  catalogSearch: (kind: CatalogKind, term: string) => ['catalog-search', kind, term] as const,
  activeSessions: () => ['active-sessions'] as const,
};
