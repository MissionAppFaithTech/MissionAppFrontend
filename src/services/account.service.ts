import type { AuthUser } from '@/lib/api/auth-response';
import type { Gender } from '@/forms/register/types';
import { registerAccountAction } from '@/app/actions/account';
import { callAction } from '@/lib/api/callAction';
import { ApiError } from '@/lib/api/client';
import { localizeApiErrorMessage } from '@/lib/api/errors';

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

export function toApiGender(gender: Gender | '' | undefined): 'MALE' | 'FEMALE' {
  if (gender === 'feminino') return 'FEMALE';
  if (gender === 'masculino') return 'MALE';
  throw new Error('Selecione o gênero');
}

export async function registerAccount(payload: SignupPayload): Promise<{ user: AuthUser }> {
  try {
    return await callAction(() => registerAccountAction(payload));
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    throw new ApiError(
      localizeApiErrorMessage(error.message),
      error.status,
      error.fieldErrors,
      error.code
    );
  }
}
