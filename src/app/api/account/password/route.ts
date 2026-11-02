import { NextResponse } from 'next/server';
import { z } from 'zod';
import { backendFetch } from '@/lib/api/backend';
import { readJsonBody, withSession } from '@/lib/api/bff';
import { clearAuthCookies } from '@/lib/auth/cookies';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z
      .string()
      .min(8, 'A nova senha deve ter pelo menos 8 caracteres')
      .max(32, 'A nova senha deve ter no máximo 32 caracteres'),
    newPasswordConfirmation: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: 'As senhas não coincidem',
    path: ['newPasswordConfirmation'],
  });

/** The backend revokes every session after a password change, so cookies are cleared. */
export async function PATCH(request: Request) {
  const body = await readJsonBody(request, changePasswordSchema, 'Dados de senha inválidos');
  if (!body.ok) return body.response;

  return withSession(
    'api/account/password',
    'Não foi possível alterar a senha',
    async (accessToken) => {
      await backendFetch('/account/password', {
        method: 'PATCH',
        body: body.data,
        accessToken,
      });
      const response = NextResponse.json({
        message: 'Senha alterada. Entre novamente com a nova senha.',
        data: { reauthenticationRequired: true },
      });
      clearAuthCookies(response);
      return response;
    }
  );
}
