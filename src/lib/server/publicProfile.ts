import { cacheLife, cacheTag } from 'next/cache';
import { BackendApiError } from '@/lib/api/backend';
import { publicBackendFetch } from '@/lib/api/public';
import { profileTag } from '@/lib/cache/tags';
import { mapPublicProfile } from '@/services/profile.service';
import type { PublicMissionaryProfile } from '@/types/backend';
import type { ProfileData } from '@/types/profile';

/**
 * A missionary's public profile, shared by every visitor (ADR-0004): cached for
 * the `public` life and expired by the owner's saves (`profile:<username>`).
 * `null` when there is no visible profile (missing, pending, inactive or
 * deleted: the backend answers the same 404 for all). Other failures throw, so
 * the route's error boundary offers a retry.
 */
export async function getPublicProfile(username: string): Promise<ProfileData | null> {
  'use cache';
  const normalized = username.trim().toLowerCase();
  cacheTag(profileTag(normalized));
  cacheLife('public');

  // Same rule as the backend: anything else can never be a username.
  if (!/^[a-z0-9_]{3,32}$/.test(normalized)) return null;

  try {
    const result = await publicBackendFetch<{ data: { missionary: PublicMissionaryProfile } }>(
      `/public/missionaries/${encodeURIComponent(normalized)}`
    );
    return mapPublicProfile(result.data.missionary);
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 404) return null;
    throw error;
  }
}
