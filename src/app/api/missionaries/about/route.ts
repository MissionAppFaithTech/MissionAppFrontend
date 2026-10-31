import { NextResponse } from 'next/server';
import { z } from 'zod';
import { backendFetch } from '@/lib/api/backend';
import { readJsonBody, withSession } from '@/lib/api/bff';
import type { BackendMissionary } from '@/types/backend';

/** Optional text; `null` clears the field (backend `.nullable()`). */
const longText = z.string().trim().max(5000).nullable().optional();
const shortText = z.string().trim().min(1).max(255).nullable().optional();

const updateAboutBodySchema = z.object({
  aboutMe: longText,
  missionStorySummary: longText,
  originLocation: shortText,
  prayerRequest: longText,
  lifeVerse: shortText,
  faithCommunityId: z.uuid().optional(),
});

export async function PATCH(request: Request) {
  const body = await readJsonBody(request, updateAboutBodySchema, 'Dados do Sobre inválidos');
  if (!body.ok) return body.response;

  return withSession(
    'api/missionaries/about',
    'Não foi possível salvar o Sobre',
    async (accessToken) => {
      const result = await backendFetch<{ data: { missionary: BackendMissionary } }>(
        '/missionaries/about',
        { method: 'PATCH', body: body.data, accessToken }
      );
      return NextResponse.json({ data: result.data });
    }
  );
}
