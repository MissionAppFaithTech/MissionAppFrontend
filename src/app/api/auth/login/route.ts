import { NextResponse } from 'next/server';
import { z } from 'zod';
import { backendFetch } from '@/lib/api/backend';
import { bffErrorResponse } from '@/lib/api/bff';
import type { AuthTokensResponse } from '@/lib/api/auth-response';
import { applyAuthCookies } from '@/lib/auth/cookies';

const loginBodySchema = z.object({
  login: z.email(),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  const parsed = loginBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Dados de login inválidos', issues: parsed.error.issues },
      { status: 422 }
    );
  }

  try {
    const result = await backendFetch<AuthTokensResponse>('/auth/login', {
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
      'Não foi possível conectar ao servidor de autenticação',
      'api/auth/login'
    );
  }
}
