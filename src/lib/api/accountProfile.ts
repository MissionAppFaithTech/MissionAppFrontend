import { unstable_rethrow } from 'next/navigation';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import type {
  AccountProfilePayload,
  BackendMissionary,
  BackendUser,
  BackendWorkAddress,
  NamedRef,
} from '@/types/backend';

type BackendProfileResponse = {
  data: {
    user: BackendUser;
    missionary: BackendMissionary | null;
    workAddress: BackendWorkAddress | null;
    /** Sent by the backend since MissionAppBackend#142; absent on older versions. */
    missionaryAgency?: NamedRef | null;
    faithCommunity?: NamedRef | null;
  };
};

type CatalogKey = 'missionaryAgency' | 'faithCommunity';

const CATALOG_PATHS: Record<CatalogKey, string> = {
  missionaryAgency: '/missionary-agencies',
  faithCommunity: '/faith-communities',
};

/**
 * Fallback for backends without #142: looks the name up in the public catalog.
 * A name is cosmetic, so any failure but an expired session (401, which
 * `withSession` turns into a refresh) leaves it empty instead of failing the profile.
 */
async function lookupName(key: CatalogKey, id: string, accessToken: string) {
  try {
    const result = await backendFetch<{ data: Partial<Record<CatalogKey, NamedRef>> }>(
      `${CATALOG_PATHS[key]}/${encodeURIComponent(id)}`,
      { accessToken }
    );
    const entry = result.data[key];
    return entry ? { id: entry.id, name: entry.name } : null;
  } catch (error) {
    // Aborted prerender work and other Next.js control flow are not lookup failures.
    unstable_rethrow(error);
    if (error instanceof BackendApiError && error.status === 401) throw error;
    if (!(error instanceof BackendApiError && error.status === 404)) {
      console.error(`[account profile] ${key} name lookup failed`, error);
    }
    return null;
  }
}

async function catalogName(
  key: CatalogKey,
  provided: NamedRef | null | undefined,
  id: string | null | undefined,
  accessToken: string
): Promise<NamedRef | null> {
  if (provided !== undefined) return provided;
  return id ? lookupName(key, id, accessToken) : null;
}

/**
 * Loads the logged-in user's profile from the backend, resolving the agency and
 * faith community names. Shared by the BFF route and the server-rendered owner
 * pages (ADR-0005). A 401 is rethrown so callers can refresh or end the session.
 *
 * @param accessToken Session access token.
 */
export async function fetchAccountProfile(accessToken: string): Promise<AccountProfilePayload> {
  const { data } = await backendFetch<BackendProfileResponse>('/account/profile', {
    accessToken,
  });

  const [missionaryAgency, faithCommunity] = await Promise.all([
    catalogName(
      'missionaryAgency',
      data.missionaryAgency,
      data.missionary?.missionaryAgencyId,
      accessToken
    ),
    catalogName(
      'faithCommunity',
      data.faithCommunity,
      data.missionary?.faithCommunityId,
      accessToken
    ),
  ]);

  return {
    user: data.user,
    missionary: data.missionary,
    workAddress: data.workAddress,
    missionaryAgency,
    faithCommunity,
  };
}
