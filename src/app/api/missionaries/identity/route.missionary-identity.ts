import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { AUTH_COOKIE } from '@/lib/auth/cookies';

const updateIdentitySchema = z.object({
  identityType: z.enum(['CPF', 'PASSPORT']),
  identityDocument: z.string().trim().min(1).max(50),
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

  const parsed = updateIdentitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Dados de identidade inválidos.',
        issues: parsed.error.issues,
      },
      { status: 422 }
    );
  }

  try {
    const data = await backendFetch<{ data?: unknown }>('/missionaries/identity', {
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
