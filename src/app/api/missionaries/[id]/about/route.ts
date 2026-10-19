import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { extractErrorMessage } from '@/lib/api/errors';
import { AUTH_COOKIE } from '@/lib/auth/cookies';
import { isMissionaryUuid } from '@/services/missionary.service';

const optionalText = z.string().trim().max(5000).optional();
const shortText = z.string().trim().min(1).max(255).optional();

const updateAboutBodySchema = z.object({
  aboutMe: optionalText,
  missionStorySummary: optionalText,
  originLocation: shortText,
  faithCommunityId: z.uuid().optional(),
  prayerRequest: optionalText,
  lifeVerse: shortText,
});

type MissionaryAboutResponse = {
  data?: {
    missionary?: { id?: string };
  };
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isMissionaryUuid(id)) {
    return NextResponse.json({ message: 'Identificador do missionário inválido' }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  const parsed = updateAboutBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Dados do sobre inválidos', issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const store = await cookies();
  const accessToken = store.get(AUTH_COOKIE.accessToken)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: 'Faça login para editar o sobre' }, { status: 401 });
  }

  try {
    const result = await backendFetch<MissionaryAboutResponse>(`/missionaries/${id}/about`, {
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

    console.error('[api/missionaries/[id]/about]', error);
    return NextResponse.json(
      { message: 'Não foi possível conectar ao servidor para salvar o sobre' },
      { status: 502 }
    );
  }
}
