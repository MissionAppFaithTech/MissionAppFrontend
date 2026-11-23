import { NextResponse } from 'next/server';
import { z } from 'zod';
import { backendFetch } from '@/lib/api/backend';
import { readJsonBody, withSession } from '@/lib/api/bff';
import type { BackendCursorMeta, BackendImpactProject } from '@/types/backend';

const createImpactProjectSchema = z.object({
  title: z.string().trim().min(1, 'Informe o título').max(255),
  description: z.string().trim().min(1, 'Informe a descrição').max(10000),
  coverImageAssetId: z.uuid(),
  videoUrl: z.string().trim().max(2048).optional(),
});

const LIST_PARAMS = ['search', 'missionaryId', 'cursor', 'limit'] as const;

export async function GET(request: Request) {
  const incoming = new URL(request.url).searchParams;
  const query = new URLSearchParams();
  for (const name of LIST_PARAMS) {
    const value = incoming.get(name);
    if (value) query.set(name, value);
  }
  const suffix = query.size > 0 ? `?${query}` : '';

  return withSession(
    'api/impact-projects GET',
    'Não foi possível carregar os projetos de impacto',
    async (accessToken) => {
      const result = await backendFetch<{
        data: { impactProjects: BackendImpactProject[] };
        meta: BackendCursorMeta;
      }>(`/impact-projects${suffix}`, { accessToken });
      return NextResponse.json({ data: result.data.impactProjects, meta: result.meta });
    }
  );
}

export async function POST(request: Request) {
  const body = await readJsonBody(
    request,
    createImpactProjectSchema,
    'Dados do projeto de impacto inválidos'
  );
  if (!body.ok) return body.response;

  return withSession(
    'api/impact-projects POST',
    'Não foi possível criar o projeto de impacto',
    async (accessToken) => {
      const result = await backendFetch<{ data: { impactProject: BackendImpactProject } }>(
        '/impact-projects',
        { method: 'POST', body: body.data, accessToken }
      );
      return NextResponse.json({ data: result.data }, { status: 201 });
    }
  );
}
