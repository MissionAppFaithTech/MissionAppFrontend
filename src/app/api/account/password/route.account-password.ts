import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { AUTH_COOKIE } from '@/lib/auth/cookies';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
    newPasswordConfirmation: z.string().min(8, 'Confirmação deve ter pelo menos 8 caracteres'),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: 'As senhas não coincidem',
    path: ['newPasswordConfirmation'],
  });

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE.accessToken)?.value;

  if (!token) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Dados inválidos para alteração de senha.',
        issues: parsed.error.issues,
      },
      { status: 422 }
    );
  }

  try {
    const data = await backendFetch<{ message?: string }>('/account/password', {
      method: 'PATCH',
      body: parsed.data,
      accessToken: token,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        typeof error.body === 'object' && error.body !== null
          ? error.body
          : { message: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json({ message: 'Serviço temporariamente indisponível.' }, { status: 503 });
  }
}
