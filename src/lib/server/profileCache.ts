import { refresh, updateTag } from 'next/cache';
import { backendFetch } from '@/lib/api/backend';
import { profileTag } from '@/lib/cache/tags';
import type { BackendUser } from '@/types/backend';

/** The logged-in user's username, to find their public profile cache entry. */
export async function ownerUsername(accessToken: string): Promise<string | undefined> {
  try {
    const result = await backendFetch<{ data: { user: Pick<BackendUser, 'username'> } }>(
      '/account/profile',
      { accessToken }
    );
    return result.data.user.username;
  } catch (error) {
    // The save already happened: a stale public page for a few minutes is the worst case.
    console.error('[profile cache] username lookup failed', error);
    return undefined;
  }
}

/**
 * After the owner saves public profile data: expires the public profile cache
 * (ADR-0004) and re-renders the current page with the saved data, in the same
 * response (ADR-0006). Server Actions only.
 */
export function showSavedProfile(...usernames: Array<string | undefined>) {
  for (const username of new Set(usernames)) {
    if (username) updateTag(profileTag(username));
  }
  refresh();
}
