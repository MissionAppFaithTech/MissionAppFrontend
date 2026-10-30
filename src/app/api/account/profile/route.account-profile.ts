import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { extractErrorMessage } from '@/lib/api/errors';
import { AUTH_COOKIE } from '@/lib/auth/cookies';

const updateAccountProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(255).optional(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9_]+$/)
    .optional(),
  biography: z.string().trim().max(200).optional(),
  profilePictureId: z.uuid().optional(),
});

type BackendUser = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  biography?: string;
  profilePictureId?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};

type BackendMissionary = {
  id: string;
  status?: string;
  identityType?: string;
  identityDocument?: string;
  publicEmail?: string;
  publicPhone?: string;
  donationMessage?: string;
  aboutMe?: string;
  missionStorySummary?: string;
  originLocation?: string;
  faithCommunityId?: string;
  prayerRequest?: string;
  lifeVerse?: string;
  missionaryAgencyId?: string;
  userId?: string;
  createdAt?: string;
};

type BackendWorkAddress = {
  id: string;
  zip?: string;
  district?: string;
  city?: string;
  state?: string;
  country?: string;
};

type BackendProfileResponse = {
  data?: {
    user?: BackendUser;
    missionary?: BackendMissionary | null;
    workAddress?: BackendWorkAddress | null;
  };
  user?: BackendUser;
  missionary?: BackendMissionary | null;
  workAddress?: BackendWorkAddress | null;
};

export async function GET() {
  const store = await cookies();
  const accessToken = store.get(AUTH_COOKIE.accessToken)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
  }

  try {
    const result = await backendFetch<BackendProfileResponse>('/account/profile', {
      method: 'GET',
      accessToken,
    });

    const payload = result?.data ?? result;
    return NextResponse.json({ data: payload });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        typeof error.body === 'object' && error.body !== null
          ? { ...error.body, message: extractErrorMessage(error.body, error.message) }
          : { message: extractErrorMessage(error.body, error.message) },
        { status: error.status }
      );
    }

    console.error('[api/account/profile GET]', error);
    return NextResponse.json(
      { message: 'Não foi possível carregar o perfil do usuário' },
      { status: 502 }
    );
  }
}

export async function PATCH(request: Request) {
  const store = await cookies();
  const accessToken = store.get(AUTH_COOKIE.accessToken)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  const parsed = updateAccountProfileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Dados de perfil inválidos', issues: parsed.error.issues },
      { status: 422 }
    );
  }

  try {
    const result = await backendFetch<{ data?: { user?: unknown }; user?: unknown }>(
      '/account/profile',
      {
        method: 'PATCH',
        body: parsed.data,
        accessToken,
      }
    );

    const payload = result?.data ?? result;
    return NextResponse.json({ data: payload });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        typeof error.body === 'object' && error.body !== null
          ? { ...error.body, message: extractErrorMessage(error.body, error.message) }
          : { message: extractErrorMessage(error.body, error.message) },
        { status: error.status }
      );
    }

    console.error('[api/account/profile PATCH]', error);
    return NextResponse.json(
      { message: 'Não foi possível atualizar o perfil do usuário' },
      { status: 502 }
    );
  }
}
