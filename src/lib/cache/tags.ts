import type { CatalogKind } from '@/lib/query/keys';

/**
 * Cache tag of a missionary's public profile (ADR-0004). The public page caches
 * by it and the profile actions expire it so the owner reads their own writes.
 * Usernames are stored in lowercase by the backend.
 */
export function profileTag(username: string): string {
  return `profile:${username.trim().toLowerCase()}`;
}

/**
 * Cache tag of a catalog's searches (backend ADR-0041). Creating an agency or a
 * faith community expires it, so the new item shows up in the next search.
 */
export function catalogTag(kind: CatalogKind): string {
  return `catalog:${kind}`;
}
