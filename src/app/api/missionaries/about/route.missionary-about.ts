import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { extractErrorMessage } from '@/lib/api/errors';
import { AUTH_COOKIE } from '@/lib/auth/cookies';

const cleanOptionalText = z
  .string()
  .trim()
  .max(5000)
  .optional()
  .or(z.literal(''))
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined));

const cleanShortText = z
  .string()
  .trim()
  .max(255)
  .optional()
  .or(z.literal(''))
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined));

const cleanUuid = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined))
  .pipe(z.uuid().optional());

const updateAboutBodySchema = z.object({
  aboutMe: cleanOptionalText,
  missionStorySummary: cleanOptionalText,
  originLocation: cleanShortText,
  faithCommunityId: cleanUuid,
  prayerRequest: cleanOptionalText,
  lifeVerse: cleanShortText,
});

type MissionaryAboutResponse = {
  data?: {
    missionary?: { id?: string };
  };
};

export async function PATCH(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  const parsed = updateAboutBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Dados do sobre inválidos', issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const store = await cookies();
  const accessToken = store.get(AUTH_COOKIE.accessToken)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: 'Faça login para editar o sobre' }, { status: 401 });
  }

  try {
    const result = await backendFetch<MissionaryAboutResponse>('/missionaries/about', {
      method: 'PATCH',
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

    console.error('[api/missionaries/about]', error);
    return NextResponse.json(
      { message: 'Não foi possível conectar ao servidor para salvar o sobre' },
      { status: 502 }
    );
  }
}
