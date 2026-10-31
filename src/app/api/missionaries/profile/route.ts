import { NextResponse } from 'next/server';
import { z } from 'zod';
import { backendFetch } from '@/lib/api/backend';
import { readJsonBody, withSession } from '@/lib/api/bff';
import { clearAuthCookies } from '@/lib/auth/cookies';
import type { BackendMissionary } from '@/types/backend';

const E164 = /^\+[1-9]\d{1,14}$/;

const updateProfileBodySchema = z.object({
  /** `null` removes the public contact. */
  publicEmail: z.email().max(254).nullable().optional(),
  publicPhone: z.string().regex(E164).nullable().optional(),
  publicPhoneIsWhatsapp: z.boolean().optional(),
  donationMessage: z.string().trim().max(5000).nullable().optional(),
});

const createProfileBodySchema = z.object({
  missionaryAgencyId: z.uuid(),
});

/**
 * Converts the logged-in supporter into a missionary. The backend revokes every
 * session afterwards, so the auth cookies are cleared and the user must log in again.
 */
export async function POST(request: Request) {
  const body = await readJsonBody(
    request,
    createProfileBodySchema,
    'Selecione uma agência missionária válida'
  );
  if (!body.ok) return body.response;

  return withSession(
    'api/missionaries/profile POST',
    'Não foi possível criar o perfil missionário',
    async (accessToken) => {
      const result = await backendFetch<{ data: { missionary: BackendMissionary } }>(
        '/missionaries/profile',
        { method: 'POST', body: body.data, accessToken }
      );
      const response = NextResponse.json({
        data: { missionary: result.data.missionary, reauthenticationRequired: true },
      });
      clearAuthCookies(response);
      return response;
    }
  );
}

export async function PATCH(request: Request) {
  const body = await readJsonBody(request, updateProfileBodySchema, 'Contatos públicos inválidos');
  if (!body.ok) return body.response;

  return withSession(
    'api/missionaries/profile PATCH',
    'Não foi possível salvar os contatos públicos',
    async (accessToken) => {
      const result = await backendFetch<{ data: { missionary: BackendMissionary } }>(
        '/missionaries/profile',
        { method: 'PATCH', body: body.data, accessToken }
      );
      return NextResponse.json({ data: result.data });
    }
  );
}
