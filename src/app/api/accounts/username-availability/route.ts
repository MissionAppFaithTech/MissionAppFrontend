import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';
import { bffErrorResponse } from '@/lib/api/bff';

type UsernameAvailabilityResponse = {
  data: {
    available: boolean;
    username: string;
    suggestions: string[];
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = (searchParams.get('username') ?? '').trim().toLowerCase();

  if (username.length < 3 || username.length > 32 || !/^[a-z0-9_]+$/.test(username)) {
    return NextResponse.json(
      {
        message: 'Nome de usuário inválido. Use 3–32 caracteres: letras minúsculas, números e _.',
      },
      { status: 422 }
    );
  }

  try {
    const result = await backendFetch<UsernameAvailabilityResponse>(
      `/accounts/username-availability?username=${encodeURIComponent(username)}`
    );

    return NextResponse.json(result);
  } catch (error) {
    return bffErrorResponse(
      error,
      'Não foi possível verificar o nome de usuário',
      'api/accounts/username-availability'
    );
  }
}
