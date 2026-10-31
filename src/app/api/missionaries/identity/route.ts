import { NextResponse } from 'next/server';
import { z } from 'zod';
import { backendFetch } from '@/lib/api/backend';
import { readJsonBody, withSession } from '@/lib/api/bff';
import type { BackendMissionary } from '@/types/backend';

const updateIdentitySchema = z.object({
  identityType: z.enum(['CPF', 'PASSPORT']),
  identityDocument: z.string().trim().min(1).max(50),
});

export async function PATCH(request: Request) {
  const body = await readJsonBody(
    request,
    updateIdentitySchema,
    'Documento de identidade inválido'
  );
  if (!body.ok) return body.response;

  return withSession(
    'api/missionaries/identity',
    'Não foi possível salvar o documento de identidade',
    async (accessToken) => {
      const result = await backendFetch<{ data: { missionary: BackendMissionary } }>(
        '/missionaries/identity',
        { method: 'PATCH', body: body.data, accessToken }
      );
      return NextResponse.json({ data: result.data });
    }
  );
}
