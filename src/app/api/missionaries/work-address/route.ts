import { NextResponse } from 'next/server';
import { z } from 'zod';
import { backendFetch } from '@/lib/api/backend';
import { readJsonBody, withSession } from '@/lib/api/bff';
import type { BackendWorkAddress } from '@/types/backend';

const required = (max: number) => z.string().trim().min(1).max(max);

/** Full replace (upsert): the backend requires every field. */
const updateWorkAddressSchema = z.object({
  zip: required(20),
  district: required(255),
  city: required(255),
  state: required(255),
  country: required(255),
});

export async function PATCH(request: Request) {
  const body = await readJsonBody(request, updateWorkAddressSchema, 'Local de atuação inválido');
  if (!body.ok) return body.response;

  return withSession(
    'api/missionaries/work-address',
    'Não foi possível salvar o local de atuação',
    async (accessToken) => {
      const result = await backendFetch<{ data: { workAddress: BackendWorkAddress } }>(
        '/missionaries/work-address',
        { method: 'PATCH', body: body.data, accessToken }
      );
      return NextResponse.json({ data: result.data });
    }
  );
}
