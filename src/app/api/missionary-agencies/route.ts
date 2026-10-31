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
    const result = await backendFetch('/missionary-agencies');
    return NextResponse.json(normalizeCatalogList(result, 'missionaryAgencies'));
  } catch (error) {
    return bffErrorResponse(
      error,
      'Não foi possível carregar as agências missionárias',
      'api/missionary-agencies GET'
    );
  }
}

export async function POST(request: Request) {
  const body = await readJsonBody(request, createBodySchema, 'Dados da agência inválidos');
  if (!body.ok) return body.response;

  return withSession(
    'api/missionary-agencies POST',
    'Não foi possível cadastrar a agência',
    async (accessToken) => {
      const result = await backendFetch('/missionary-agencies', {
        method: 'POST',
        body: body.data,
        accessToken,
      });
      return NextResponse.json(result);
    }
  );
}
