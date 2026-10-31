import { NextResponse } from 'next/server';
import { z } from 'zod';
import { backendFetch } from '@/lib/api/backend';
import { readJsonBody, withSession } from '@/lib/api/bff';
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

export async function GET() {
  return withSession(
    'api/missionary-agencies GET',
    'Não foi possível carregar as agências missionárias',
    async (accessToken) => {
      const result = await backendFetch('/missionary-agencies', { accessToken });
      return NextResponse.json(normalizeCatalogList(result, 'missionaryAgencies'));
    }
  );
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
