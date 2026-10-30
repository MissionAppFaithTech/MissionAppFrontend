import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { AUTH_COOKIE } from '@/lib/auth/cookies';

const updateWorkAddressSchema = z.object({
  zip: z.string().trim().min(1).max(20),
  district: z.string().trim().min(1),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  country: z.string().trim().min(1),
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

  const parsed = updateWorkAddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Dados inválidos para endereço de atuação.',
        issues: parsed.error.issues,
      },
      { status: 422 }
    );
  }

  try {
    const data = await backendFetch<{ data?: unknown }>('/missionaries/work-address', {
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
