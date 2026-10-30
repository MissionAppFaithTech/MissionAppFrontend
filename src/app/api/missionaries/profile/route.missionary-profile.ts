import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { extractErrorMessage } from '@/lib/api/errors';
import { AUTH_COOKIE } from '@/lib/auth/cookies';

const updateProfileBodySchema = z.object({
  publicEmail: z.email().optional().or(z.literal('')),
  publicPhone: z.string().optional().or(z.literal('')),
  donationMessage: z.string().trim().max(5000).optional(),
});

const createProfileBodySchema = z.object({
  missionaryAgencyId: z.uuid(),
});

type MissionaryProfileResponse = {
  data?: {
    missionary?: { id?: string };
  };
};

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  const parsed = createProfileBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Dados de criação de perfil inválidos', issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const store = await cookies();
  const accessToken = store.get(AUTH_COOKIE.accessToken)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: 'Faça login para criar o perfil' }, { status: 401 });
  }

  try {
    const result = await backendFetch<MissionaryProfileResponse>('/missionaries/profile', {
      method: 'POST',
      body: parsed.data,
      accessToken,
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

    console.error('[api/missionaries/profile POST]', error);
    return NextResponse.json(
      { message: 'Não foi possível conectar ao servidor para criar o perfil' },
      { status: 502 }
    );
  }
}

export async function PATCH(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  const parsed = updateProfileBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Dados de perfil inválidos', issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const store = await cookies();
  const accessToken = store.get(AUTH_COOKIE.accessToken)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: 'Faça login para editar o perfil' }, { status: 401 });
  }

  const bodyData: {
    publicEmail?: string;
    publicPhone?: string;
    donationMessage?: string;
  } = {};

  if (parsed.data.publicEmail) bodyData.publicEmail = parsed.data.publicEmail;
  if (parsed.data.publicPhone) bodyData.publicPhone = parsed.data.publicPhone;
  if (parsed.data.donationMessage) bodyData.donationMessage = parsed.data.donationMessage;

  try {
    const result = await backendFetch<MissionaryProfileResponse>('/missionaries/profile', {
      method: 'PATCH',
      body: bodyData,
      accessToken,
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

    console.error('[api/missionaries/profile]', error);
    return NextResponse.json(
      { message: 'Não foi possível conectar ao servidor para salvar o perfil' },
      { status: 502 }
    );
  }
}
