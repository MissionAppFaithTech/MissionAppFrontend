import type { ActionResult } from '@/lib/api/actionResult';
import { ApiError, SESSION_EXPIRED_EVENT } from '@/lib/api/client';

const CONNECTION_ERROR = 'Não foi possível conectar. Verifique sua internet e tente novamente.';

/**
 * Calls a Server Action from the browser and returns its data, or throws
 * {@link ApiError} with the message and field errors for the form, like
 * `bffRequest`. A 401 dispatches {@link SESSION_EXPIRED_EVENT} first.
 */
export async function callAction<T>(run: () => Promise<ActionResult<T>>): Promise<T> {
  let result: ActionResult<T>;
  try {
    result = await run();
  } catch (error) {
    // The request itself failed (offline, or a deploy replaced the action).
    console.error('[action]', error);
    throw new ApiError(CONNECTION_ERROR, 0);
  }

  if (result.ok) return result.data;

  if (result.status === 401 && typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
  throw new ApiError(result.message, result.status, result.fieldErrors ?? {}, result.code);
}
