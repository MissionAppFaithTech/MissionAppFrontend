import { NextResponse } from 'next/server';
import { z } from 'zod';
import { backendFetch } from '@/lib/api/backend';
import { readJsonBody, withSession } from '@/lib/api/bff';
import type { BackendImpactProject } from '@/types/backend';

type RouteContext = { params: Promise<{ id: string }> };

/** Every field is optional; `videoUrl: null` removes the video. */
const updateImpactProjectSchema = z.object({
  title: z.string().trim().min(1, 'Informe o título').max(255).optional(),
  description: z.string().trim().min(1, 'Informe a descrição').max(10000).optional(),
  coverImageAssetId: z.uuid().optional(),
  videoUrl: z.string().trim().max(2048).nullable().optional(),
});

async function projectId(context: RouteContext): Promise<string | null> {
  const { id } = await context.params;
  return z.uuid().safeParse(id).success ? id : null;
}

const invalidId = () => NextResponse.json({ message: 'Projeto inválido' }, { status: 422 });

export async function GET(_request: Request, context: RouteContext) {
  const id = await projectId(context);
  if (!id) return invalidId();

  return withSession(
    'api/impact-projects/[id] GET',
    'Não foi possível carregar o projeto de impacto',
    async (accessToken) => {
      const result = await backendFetch<{ data: { impactProject: BackendImpactProject } }>(
        `/impact-projects/${id}`,
        { accessToken }
      );
      return NextResponse.json({ data: result.data });
    }
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const id = await projectId(context);
  if (!id) return invalidId();

  const body = await readJsonBody(
    request,
    updateImpactProjectSchema,
    'Dados do projeto de impacto inválidos'
  );
  if (!body.ok) return body.response;

  return withSession(
    'api/impact-projects/[id] PATCH',
    'Não foi possível salvar o projeto de impacto',
    async (accessToken) => {
      const result = await backendFetch<{ data: { impactProject: BackendImpactProject } }>(
        `/impact-projects/${id}`,
        { method: 'PATCH', body: body.data, accessToken }
      );
      return NextResponse.json({ data: result.data });
    }
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const id = await projectId(context);
  if (!id) return invalidId();

  return withSession(
    'api/impact-projects/[id] DELETE',
    'Não foi possível excluir o projeto de impacto',
    async (accessToken) => {
      await backendFetch(`/impact-projects/${id}`, { method: 'DELETE', accessToken });
      return NextResponse.json({ message: 'Projeto de impacto removido com sucesso' });
    }
  );
}
