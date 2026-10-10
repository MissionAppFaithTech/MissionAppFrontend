import type { AuthUser } from '@/lib/api/auth-response';
import type { Gender } from '@/forms/register/types';
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
  const response = await fetch('/api/accounts', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body?.message === 'string' ? body.message : 'Não foi possível concluir o cadastro';
    throw new Error(localizeApiErrorMessage(message));
  }

  return { user: body.data.user as AuthUser };
}
