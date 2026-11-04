'use server';

import { cookies, headers } from 'next/headers';
import type { AuthTokensResponse, AuthUser } from '@/lib/api/auth-response';
import { backendFetch } from '@/lib/api/backend';
import { expireAuthCookies, setAuthCookies } from '@/lib/auth/cookies';
import { deviceHeaders, deviceIdFor, rememberDeviceId } from '@/lib/auth/device';
import { actionFailure, parseInput, runWithSession, type ActionResult } from '@/lib/server/action';
import { ownerUsername, showSavedProfile } from '@/lib/server/profileCache';
import {
  changePasswordInputSchema,
  signupInputSchema,
  updateAccountProfileInputSchema,
} from '@/schemas/actions.schema';
import type { BackendUser } from '@/types/backend';

/** Account mutations (ADR-0006). Inputs are untrusted: always validated here. */

export async function registerAccountAction(input: {
  fullName: string;
  username: string;
  phoneNumber: string;
  gender: 'MALE' | 'FEMALE';
  email: string;
  password: string;
  passwordConfirmation: string;
}): Promise<ActionResult<{ user: AuthUser }>> {
  const parsed = parseInput(signupInputSchema, input, 'Dados de cadastro inválidos');
  if (!parsed.ok) return parsed;
  if (parsed.data.password !== parsed.data.passwordConfirmation) {
    return { ok: false, status: 422, message: 'As senhas não coincidem' };
  }

  try {
    const store = await cookies();
    const deviceId = deviceIdFor(store);
    const result = await backendFetch<AuthTokensResponse>('/accounts', {
      method: 'POST',
      body: parsed.data,
      headers: deviceHeaders(await headers(), deviceId),
    });
    setAuthCookies(store, {
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
    });
    rememberDeviceId(store, deviceId);
    return { ok: true, data: { user: result.data.user } };
  } catch (error) {
    return actionFailure(
      error,
      'Não foi possível conectar ao servidor de cadastro',
      'actions/accounts'
    );
  }
}

/** The backend revokes every session after a password change, so cookies are cleared. */
export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}): Promise<ActionResult<{ reauthenticationRequired: true }>> {
  const parsed = parseInput(changePasswordInputSchema, input, 'Dados de senha inválidos');
  if (!parsed.ok) return parsed;

  const store = await cookies();
  return runWithSession(
    'actions/change-password',
    'Não foi possível alterar a senha',
    async (accessToken) => {
      await backendFetch('/account/password', {
        method: 'PATCH',
        body: parsed.data,
        accessToken,
      });
      expireAuthCookies(store);
      return { reauthenticationRequired: true as const };
    }
  );
}

/**
 * Saves the header fields. Expires the public profile cache under the old and
 * the new username (ADR-0004) and re-renders the page with the saved data.
 */
export async function updateAccountProfileAction(input: {
  fullName?: string;
  username?: string;
  biography?: string | null;
}): Promise<ActionResult<{ user: BackendUser }>> {
  const parsed = parseInput(updateAccountProfileInputSchema, input, 'Dados de perfil inválidos');
  if (!parsed.ok) return parsed;

  const result = await runWithSession(
    'actions/account-profile',
    'Não foi possível salvar o perfil',
    async (accessToken) => {
      // A new username moves the public page: the old one must stop being served.
      const previous = parsed.data.username ? await ownerUsername(accessToken) : undefined;
      const saved = await backendFetch<{ data: { user: BackendUser } }>('/account/profile', {
        method: 'PATCH',
        body: parsed.data,
        accessToken,
      });
      return { user: saved.data.user, previous };
    }
  );
  if (!result.ok) return result;

  const { user, previous } = result.data;
  showSavedProfile(previous, user.username);
  return { ok: true, data: { user } };
}
