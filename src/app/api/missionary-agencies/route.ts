import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { extractErrorMessage } from '@/lib/api/errors';
import { AUTH_COOKIE } from '@/lib/auth/cookies';
import { normalizeCatalogList } from '@/services/catalog.service';

const createBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
  phoneNumber: z.string().trim().optional(),
  addressLine1: z.string().trim().optional(),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  website: z.string().trim().optional(),
});

async function accessToken() {
  const store = await cookies();
  return store.get(AUTH_COOKIE.accessToken)?.value;
}

export async function GET() {
  try {
    const token = await accessToken();
    const result = await backendFetch('/missionary-agencies', {
      accessToken: token,
    });
    return NextResponse.json(normalizeCatalogList(result, 'missionaryAgencies'));
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        typeof error.body === 'object' && error.body !== null
          ? { ...error.body, message: extractErrorMessage(error.body, error.message) }
          : { message: extractErrorMessage(error.body, error.message) },
        { status: error.status }
      );
    }

    console.error('[api/missionary-agencies]', error);
    return NextResponse.json(
      { message: 'Não foi possível carregar as agências missionárias' },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const token = await accessToken();
  if (!token) {
    return NextResponse.json({ message: 'Faça login para cadastrar a agência' }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  const parsed = createBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Dados da agência inválidos' }, { status: 422 });
  }

  try {
    const result = await backendFetch('/missionary-agencies', {
      method: 'POST',
      body: parsed.data,
      accessToken: token,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        typeof error.body === 'object' && error.body !== null
          ? { ...error.body, message: extractErrorMessage(error.body, error.message) }
          : { message: extractErrorMessage(error.body, error.message) },
        { status: error.status }
      );
    }

    console.error('[api/missionary-agencies]', error);
    return NextResponse.json(
      { message: 'Não foi possível conectar ao servidor para cadastrar a agência' },
      { status: 502 }
    );
  }
}
