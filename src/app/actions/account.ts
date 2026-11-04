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
  missionarySignupInputSchema,
  signupInputSchema,
  updateAccountProfileInputSchema,
} from '@/schemas/actions.schema';
import type { BackendUser, MissionaryProfilePayload } from '@/types/backend';

/** Account mutations (ADR-0006). Inputs are untrusted: always validated here. */

type SignupInput = {
  fullName: string;
  username: string;
  phoneNumber: string;
  gender: 'MALE' | 'FEMALE';
  email: string;
  password: string;
  passwordConfirmation: string;
};

type CatalogItemInput = {
  name: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
};

export type MissionarySignupInput = SignupInput & {
  /** `YYYY-MM-DD`. */
  birthDate: string;
  identityType?: 'CPF' | 'PASSPORT';
  identityDocument?: string;
  aboutMe?: string;
  /** A catalog agency, or `missionaryAgency` to register a new one (exactly one). */
  missionaryAgencyId?: string;
  missionaryAgency?: CatalogItemInput;
  /** A catalog community, or `faithCommunity` to register a new one (at most one). */
  faithCommunityId?: string;
  faithCommunity?: CatalogItemInput & { pastorName?: string; pastorPhone?: string };
};

type SignupResponse<T> = { data: AuthTokensResponse['data'] & T };

/**
 * Posts a public sign-up and stores the session it returns in httpOnly cookies,
 * sending the device headers the backend keys the session on.
 */
async function signUp<T>(
  path: string,
  body: object,
  fallbackMessage: string,
  tag: string
): Promise<ActionResult<SignupResponse<T>['data']>> {
  try {
    const store = await cookies();
    const deviceId = deviceIdFor(store);
    const result = await backendFetch<SignupResponse<T>>(path, {
      method: 'POST',
      body,
      headers: deviceHeaders(await headers(), deviceId),
    });
    setAuthCookies(store, {
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
    });
    rememberDeviceId(store, deviceId);
    return { ok: true, data: result.data };
  } catch (error) {
    return actionFailure(error, fallbackMessage, tag);
  }
}

const PASSWORD_MISMATCH = { ok: false, status: 422, message: 'As senhas não coincidem' } as const;

export async function registerAccountAction(
  input: SignupInput
): Promise<ActionResult<{ user: AuthUser }>> {
  const parsed = parseInput(signupInputSchema, input, 'Dados de cadastro inválidos');
  if (!parsed.ok) return parsed;
  if (parsed.data.password !== parsed.data.passwordConfirmation) return PASSWORD_MISMATCH;

  const result = await signUp(
    '/accounts',
    parsed.data,
    'Não foi possível conectar ao servidor de cadastro',
    'actions/accounts'
  );
  return result.ok ? { ok: true, data: { user: result.data.user } } : result;
}

/**
 * Signs up a missionary in one request (`POST /accounts/missionaries`). The
 * session it returns already has the MISSIONARY role: no second login.
 */
export async function registerMissionaryAction(
  input: MissionarySignupInput
): Promise<ActionResult<{ user: AuthUser } & MissionaryProfilePayload>> {
  const parsed = parseInput(missionarySignupInputSchema, input, 'Dados de cadastro inválidos');
  if (!parsed.ok) return parsed;
  if (parsed.data.password !== parsed.data.passwordConfirmation) return PASSWORD_MISMATCH;

  const result = await signUp<MissionaryProfilePayload>(
    '/accounts/missionaries',
    parsed.data,
    'Não foi possível conectar ao servidor de cadastro',
    'actions/accounts-missionaries'
  );
  if (!result.ok) return result;
  const { user, missionary, workAddress, missionaryAgency, faithCommunity } = result.data;
  return { ok: true, data: { user, missionary, workAddress, missionaryAgency, faithCommunity } };
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
  profilePictureId?: string | null;
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
