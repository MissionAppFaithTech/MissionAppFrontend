import { NextResponse } from 'next/server';
import { z } from 'zod';
import { backendFetch } from '@/lib/api/backend';
import { bffErrorResponse, readJsonBody, withSession } from '@/lib/api/bff';
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

/** Public listing (backend PR #137): no session needed, so sign-up can list it. */
export async function GET() {
  try {
    const result = await backendFetch('/faith-communities');
    return NextResponse.json(normalizeCatalogList(result, 'faithCommunities'));
  } catch (error) {
    return bffErrorResponse(
      error,
      'Não foi possível carregar as comunidades de fé',
      'api/faith-communities GET'
    );
  }
}

export async function POST(request: Request) {
  const body = await readJsonBody(request, createBodySchema, 'Dados da igreja inválidos');
  if (!body.ok) return body.response;

  return withSession(
    'api/faith-communities POST',
    'Não foi possível cadastrar a igreja',
    async (accessToken) => {
      const result = await backendFetch('/faith-communities', {
        method: 'POST',
        body: body.data,
        accessToken,
      });
      return NextResponse.json(result);
    }
  );
}
