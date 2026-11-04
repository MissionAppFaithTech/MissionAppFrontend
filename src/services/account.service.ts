import type { AuthUser } from '@/lib/api/auth-response';
import type { Gender } from '@/forms/register/types';
import {
  registerAccountAction,
  registerMissionaryAction,
  type MissionarySignupInput,
} from '@/app/actions/account';
import { callAction } from '@/lib/api/callAction';

export type SignupPayload = {
  fullName: string;
  username: string;
  phoneNumber: string;
  gender: 'MALE' | 'FEMALE';
  email: string;
  password: string;
  passwordConfirmation: string;
};

export function toE164Phone(phone: string): string {
  const compact = phone.replace(/[^\d+]/g, '');
  if (compact.startsWith('+')) return compact;
  return `+${compact.replace(/^\+/, '')}`;
}

/** `DD/MM/AAAA` (the form mask) → `YYYY-MM-DD` (the API). */
export function toApiBirthDate(value: string): string {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) throw new Error('Informe a data de nascimento no formato DD/MM/AAAA');
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

export function toApiGender(gender: Gender | '' | undefined): 'MALE' | 'FEMALE' {
  if (gender === 'feminino') return 'FEMALE';
  if (gender === 'masculino') return 'MALE';
  throw new Error('Selecione o gênero');
}

/** Throws `ApiError` with the pt-BR message and field errors from the action. */
export async function registerAccount(payload: SignupPayload): Promise<{ user: AuthUser }> {
  return callAction(() => registerAccountAction(payload));
}

/**
 * Signs up a missionary in one request; the session cookies it sets already
 * have the MISSIONARY role. Throws `ApiError` with the field errors.
 */
export async function registerMissionary(
  payload: MissionarySignupInput
): Promise<{ user: AuthUser }> {
  const { user } = await callAction(() => registerMissionaryAction(payload));
  return { user };
}
