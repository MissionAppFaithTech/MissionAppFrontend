import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { bffErrorResponse, readJsonBody } from '@/lib/api/bff';
import { toBffError } from '@/lib/api/errors';

/** Backend field names → this form's field names. */
const FORM_FIELDS: Record<string, string> = {
  newPassword: 'password',
  newPasswordConfirmation: 'passwordConfirmation',
};

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .max(32, 'A senha deve ter no máximo 32 caracteres'),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirmation'],
  });

export async function POST(request: Request) {
  const body = await readJsonBody(
    request,
    resetPasswordSchema,
    'Dados inválidos para redefinição de senha'
  );
  if (!body.ok) return body.response;

  try {
    const result = await backendFetch<{ message?: string }>('/auth/reset-password', {
      method: 'PATCH',
      body: {
        token: body.data.token,
        newPassword: body.data.password,
        newPasswordConfirmation: body.data.passwordConfirmation,
      },
    });
    return NextResponse.json({ message: result?.message ?? 'Senha redefinida com sucesso.' });
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 422) {
      const body = toBffError(error.status, error.body, 'Não foi possível redefinir a senha');
      const fieldErrors = Object.fromEntries(
        Object.entries(body.fieldErrors ?? {}).map(([field, message]) => [
          FORM_FIELDS[field] ?? field,
          message,
        ])
      );
      return NextResponse.json({ ...body, fieldErrors }, { status: 422 });
    }
    return bffErrorResponse(error, 'Não foi possível redefinir a senha', 'api/auth/reset-password');
  }
}
