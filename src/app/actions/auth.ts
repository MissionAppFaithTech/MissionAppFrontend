'use server';

import { cookies } from 'next/headers';
import type { AuthTokensResponse, AuthUser } from '@/lib/api/auth-response';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { toBffError } from '@/lib/api/errors';
import { expireAuthCookies, setAuthCookies, AUTH_COOKIE } from '@/lib/auth/cookies';
import { isAccessTokenExpiring } from '@/lib/auth/jwt';
import { actionFailure, parseInput, runWithSession, type ActionResult } from '@/lib/server/action';
import {
  forgotPasswordInputSchema,
  loginInputSchema,
  resetPasswordInputSchema,
} from '@/schemas/actions.schema';

/** Authentication mutations (ADR-0006). Inputs are untrusted: always validated here. */

const FORGOT_PASSWORD_SENT =
  'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir a senha.';

export async function loginAction(input: {
  login: string;
  password: string;
}): Promise<ActionResult<{ user: AuthUser }>> {
  const parsed = parseInput(loginInputSchema, input, 'Dados de login inválidos');
  if (!parsed.ok) return parsed;

  try {
    const result = await backendFetch<AuthTokensResponse>('/auth/login', {
      method: 'POST',
      body: parsed.data,
    });
    setAuthCookies(await cookies(), {
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
    });
    return { ok: true, data: { user: result.data.user } };
  } catch (error) {
    return actionFailure(
      error,
      'Não foi possível conectar ao servidor de autenticação',
      'actions/login'
    );
  }
}

/**
 * Revokes the session family on the backend and always clears the auth cookies,
 * even when the backend is unreachable, so the browser is logged out locally.
 */
export async function logoutAction(): Promise<ActionResult<{ message: string }>> {
  const store = await cookies();
  const accessToken = store.get(AUTH_COOKIE.accessToken)?.value;
  const refreshToken = store.get(AUTH_COOKIE.refreshToken)?.value;

  if (refreshToken) {
    try {
      await backendFetch('/auth/logout', {
        method: 'DELETE',
        body: { refreshToken },
        // The refresh token alone revokes the session; an expired bearer would only fail.
        accessToken:
          accessToken && !isAccessTokenExpiring(accessToken, 0) ? accessToken : undefined,
      });
    } catch (error) {
      console.error('[actions/logout]', error);
    }
  }

  expireAuthCookies(store);
  return { ok: true, data: { message: 'Você saiu da sua conta.' } };
}

export async function requestPasswordResetAction(input: {
  login: string;
}): Promise<ActionResult<{ message: string }>> {
  const parsed = parseInput(forgotPasswordInputSchema, input, 'Informe um e-mail válido');
  if (!parsed.ok) return parsed;

  try {
    const result = await backendFetch<{ message?: string } | null>('/auth/forgot-password', {
      method: 'POST',
      body: parsed.data,
    });
    return { ok: true, data: { message: result?.message ?? FORGOT_PASSWORD_SENT } };
  } catch (error) {
    if (error instanceof BackendApiError) {
      return actionFailure(error, 'Não foi possível enviar o link', 'actions/forgot-password');
    }
    // Backend unreachable: same generic answer, so the form never reveals accounts.
    console.error('[actions/forgot-password]', error);
    return { ok: true, data: { message: FORGOT_PASSWORD_SENT } };
  }
}

/** Backend field names → the reset form's field names. */
const RESET_FORM_FIELDS: Record<string, string> = {
  newPassword: 'password',
  newPasswordConfirmation: 'passwordConfirmation',
};

export async function resetPasswordAction(input: {
  token: string;
  password: string;
  passwordConfirmation: string;
}): Promise<ActionResult<{ message: string }>> {
  const parsed = parseInput(
    resetPasswordInputSchema,
    input,
    'Dados inválidos para redefinição de senha'
  );
  if (!parsed.ok) return parsed;

  try {
    const result = await backendFetch<{ message?: string } | null>('/auth/reset-password', {
      method: 'PATCH',
      body: {
        token: parsed.data.token,
        newPassword: parsed.data.password,
        newPasswordConfirmation: parsed.data.passwordConfirmation,
      },
    });
    return { ok: true, data: { message: result?.message ?? 'Senha redefinida com sucesso.' } };
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 422) {
      const body = toBffError(error.status, error.body, 'Não foi possível redefinir a senha');
      const fieldErrors = Object.fromEntries(
        Object.entries(body.fieldErrors ?? {}).map(([field, message]) => [
          RESET_FORM_FIELDS[field] ?? field,
          message,
        ])
      );
      return { ok: false, status: 422, ...body, fieldErrors };
    }
    return actionFailure(error, 'Não foi possível redefinir a senha', 'actions/reset-password');
  }
}

/** Ends every session, including this one, so the auth cookies are cleared too. */
export async function endAllSessionsAction(): Promise<ActionResult<{ message: string }>> {
  const store = await cookies();
  return runWithSession(
    'actions/end-all-sessions',
    'Não foi possível encerrar as sessões',
    async (accessToken) => {
      await backendFetch('/auth/sessions', { method: 'DELETE', accessToken });
      expireAuthCookies(store);
      return { message: 'Todas as sessões foram encerradas.' };
    }
  );
}
