import { bffRequest } from '@/lib/api/client';
import { clearUserStores } from '@/stores/sessionStore';

/**
 * Ends the session on the backend and clears the cookies (BFF). Then drops every
 * user-scoped store. The caller navigates and calls `router.refresh()` so the
 * server re-reads the (now anonymous) session. Throws `ApiError` when the BFF is
 * unreachable: the cookies are still set and nothing is cleared.
 */
export async function logout(): Promise<void> {
  await bffRequest('/api/auth/logout', {
    method: 'POST',
    fallbackMessage: 'Não foi possível sair da conta',
  });
  clearUserStores();
}
