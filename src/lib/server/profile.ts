import { cookies } from 'next/headers';
import { fetchAccountProfile } from '@/lib/api/accountProfile';
import { BackendApiError } from '@/lib/api/backend';
import { toBffError } from '@/lib/api/errors';
import { AUTH_COOKIE } from '@/lib/auth/cookies';
import { mapAccountProfile } from '@/services/profile.service';
import type { ProfileData } from '@/types/profile';

export type OwnerProfileResult =
  | { kind: 'ok'; profile: ProfileData }
  /** No session cookie: the user logged out or ended every session. */
  | { kind: 'anonymous' }
  /** The backend no longer accepts the session. */
  | { kind: 'expired' }
  | { kind: 'error'; message: string };

const LOAD_ERROR = 'Não foi possível carregar o seu perfil.';

/**
 * Loads the logged-in user's profile on the server (ADR-0005). The proxy has
 * already renewed the session (ADR-0006), so a 401 here means it ended.
 */
export async function loadMyProfile(): Promise<OwnerProfileResult> {
  const accessToken = (await cookies()).get(AUTH_COOKIE.accessToken)?.value;
  if (!accessToken) return { kind: 'anonymous' };

  try {
    return { kind: 'ok', profile: mapAccountProfile(await fetchAccountProfile(accessToken)) };
  } catch (error) {
    if (error instanceof BackendApiError) {
      if (error.status === 401) return { kind: 'expired' };
      return { kind: 'error', message: toBffError(error.status, error.body, LOAD_ERROR).message };
    }
    console.error('[profile] load failed', error);
    return { kind: 'error', message: LOAD_ERROR };
  }
}
