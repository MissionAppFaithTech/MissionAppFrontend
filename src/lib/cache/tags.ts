/**
 * Cache tag of a missionary's public profile (ADR-0004). The public page caches
 * by it and the profile actions expire it so the owner reads their own writes.
 * Usernames are stored in lowercase by the backend.
 */
export function profileTag(username: string): string {
  return `profile:${username.trim().toLowerCase()}`;
}
