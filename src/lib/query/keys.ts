/**
 * Query keys by domain (ADR-0002). Components never write keys by hand: they
 * use the hooks in `src/services/queries/`.
 */
export type CatalogKind = 'missionaryAgencies' | 'faithCommunities';

export const queryKeys = {
  usernameAvailability: (username: string) => ['username-availability', username] as const,
  catalog: (kind: CatalogKind) => ['catalog', kind] as const,
  activeSessions: () => ['active-sessions'] as const,
};
