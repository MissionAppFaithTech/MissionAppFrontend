import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { AUTH_COOKIE } from '@/lib/auth/cookies';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE.accessToken)?.value;

  if (!token) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const data = await backendFetch<{ data?: unknown }>('/auth/sessions', {
      method: 'GET',
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

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE.accessToken)?.value;

  if (!token) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const data = await backendFetch<{ message?: string }>('/auth/sessions', {
      method: 'DELETE',
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
