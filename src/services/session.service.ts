import { logoutAction } from '@/app/actions/auth';
import { callAction } from '@/lib/api/callAction';
import { clearUserStores } from '@/stores/sessionStore';

/**
 * Ends the session on the backend and clears the cookies (Server Action). Then drops every
 * user-scoped store. The caller navigates and calls `router.refresh()` so the
 * server re-reads the (now anonymous) session. Throws `ApiError` when the server is
 * unreachable: the cookies are still set and nothing is cleared.
 */
export async function logout(): Promise<void> {
  await callAction(() => logoutAction());
  clearUserStores();
}
