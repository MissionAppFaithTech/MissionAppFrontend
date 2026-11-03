import { cookies } from 'next/headers';
import type { z } from 'zod';
import { BackendApiError } from '@/lib/api/backend';
import { SESSION_EXPIRED_MESSAGE, callWithSession } from '@/lib/api/bff';
import { toBffError } from '@/lib/api/errors';
import type { ActionFailure, ActionResult } from '@/lib/api/actionResult';
import { expireAuthCookies, setAuthCookies } from '@/lib/auth/cookies';

export type { ActionFailure, ActionResult };

/** Turns any thrown error into a failure; non-backend errors become 502. */
export function actionFailure(error: unknown, fallbackMessage: string, tag: string): ActionFailure {
  if (error instanceof BackendApiError) {
    return {
      ok: false,
      status: error.status,
      ...toBffError(error.status, error.body, fallbackMessage),
    };
  }
  console.error(`[${tag}]`, error);
  return { ok: false, status: 502, message: fallbackMessage };
}

type Parsed<T> = { ok: true; data: T } | ActionFailure;

/**
 * Validates untrusted action input: Server Actions are public POST endpoints.
 * Invalid input answers 422 with the first message per field, in pt-BR.
 */
export function parseInput<S extends z.ZodType>(
  schema: S,
  input: unknown,
  invalidMessage: string
): Parsed<z.output<S>> {
  const parsed = schema.safeParse(input);
  if (parsed.success) return { ok: true, data: parsed.data };

  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return { ok: false, status: 422, message: invalidMessage, fieldErrors };
}

/**
 * Runs `handler` with the session access token inside a Server Action. A
 * refresh rewrites the auth cookies through `cookies()`; when the session is
 * gone the cookies are cleared and the action answers 401.
 */
export async function runWithSession<T>(
  tag: string,
  fallbackMessage: string,
  handler: (accessToken: string) => Promise<T>
): Promise<ActionResult<T>> {
  const store = await cookies();
  try {
    const result = await callWithSession(tag, handler, (tokens) => setAuthCookies(store, tokens));
    if (!result.ok) {
      expireAuthCookies(store);
      return { ok: false, status: 401, message: SESSION_EXPIRED_MESSAGE };
    }
    return { ok: true, data: result.value };
  } catch (error) {
    return actionFailure(error, fallbackMessage, tag);
  }
}
