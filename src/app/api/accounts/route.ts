import { NextResponse } from 'next/server';
import { z } from 'zod';
import { backendFetch } from '@/lib/api/backend';
import { bffErrorResponse } from '@/lib/api/bff';
import type { AuthTokensResponse } from '@/lib/api/auth-response';
import { applyAuthCookies } from '@/lib/auth/cookies';

const signupBodySchema = z.object({
  fullName: z.string().trim().min(1).max(255),
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9_]+$/),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/),
  gender: z.enum(['MALE', 'FEMALE']),
  email: z.email(),
  password: z.string().min(8).max(32),
  passwordConfirmation: z.string().min(8).max(32),
});

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  const parsed = signupBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Dados de cadastro inválidos', issues: parsed.error.issues },
      { status: 422 }
    );
  }

  if (parsed.data.password !== parsed.data.passwordConfirmation) {
    return NextResponse.json({ message: 'As senhas não coincidem' }, { status: 422 });
  }

  try {
    const result = await backendFetch<AuthTokensResponse>('/accounts', {
      method: 'POST',
      body: parsed.data,
    });

    const response = NextResponse.json({
      data: {
        user: result.data.user,
      },
    });

    applyAuthCookies(response, {
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
    });

    return response;
  } catch (error) {
    return bffErrorResponse(
      error,
      'Não foi possível conectar ao servidor de cadastro',
      'api/accounts'
    );
  }
}
