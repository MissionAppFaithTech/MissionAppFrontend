import { NextResponse } from 'next/server';
import { z } from 'zod';
import { backendFetch } from '@/lib/api/backend';
import { readJsonBody, withSession } from '@/lib/api/bff';
import { BIO_MAX_LENGTH } from '@/schemas/profile.schema';
import type { BackendUser } from '@/types/backend';

const updateAccountProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(255).optional(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9_]+$/)
    .optional(),
  /** `null` clears the mini-bio. */
  biography: z.string().trim().max(BIO_MAX_LENGTH).nullable().optional(),
});

export async function PATCH(request: Request) {
  const body = await readJsonBody(request, updateAccountProfileSchema, 'Dados de perfil inválidos');
  if (!body.ok) return body.response;

  return withSession(
    'api/account/profile PATCH',
    'Não foi possível salvar o perfil',
    async (accessToken) => {
      const result = await backendFetch<{ data: { user: BackendUser } }>('/account/profile', {
        method: 'PATCH',
        body: body.data,
        accessToken,
      });
      return NextResponse.json({ data: result.data });
    }
  );
}
