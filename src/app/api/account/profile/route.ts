import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { readJsonBody, withSession } from '@/lib/api/bff';
import type {
  AccountProfilePayload,
  BackendMissionary,
  BackendUser,
  BackendWorkAddress,
  NamedRef,
} from '@/types/backend';

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
  biography: z.string().trim().max(200).nullable().optional(),
});

type BackendProfileResponse = {
  data: {
    user: BackendUser;
    missionary: BackendMissionary | null;
    workAddress: BackendWorkAddress | null;
  };
};

/** Resolves a catalog id to `{ id, name }`; a missing entry is not fatal for the profile. */
async function resolveName(
  path: string,
  key: 'missionaryAgency' | 'faithCommunity',
  accessToken: string
): Promise<NamedRef | null> {
  try {
    const result = await backendFetch<{ data: Record<string, { id: string; name: string }> }>(
      path,
      { accessToken }
    );
    const entry = result.data[key];
    return entry ? { id: entry.id, name: entry.name } : null;
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 404) return null;
    throw error;
  }
}

export async function GET() {
  return withSession(
    'api/account/profile GET',
    'Não foi possível carregar o perfil',
    async (accessToken) => {
      const { data } = await backendFetch<BackendProfileResponse>('/account/profile', {
        accessToken,
      });

      const agencyId = data.missionary?.missionaryAgencyId;
      const communityId = data.missionary?.faithCommunityId;
      const [missionaryAgency, faithCommunity] = await Promise.all([
        agencyId
          ? resolveName(
              `/missionary-agencies/${encodeURIComponent(agencyId)}`,
              'missionaryAgency',
              accessToken
            )
          : null,
        communityId
          ? resolveName(
              `/faith-communities/${encodeURIComponent(communityId)}`,
              'faithCommunity',
              accessToken
            )
          : null,
      ]);

      const payload: AccountProfilePayload = {
        user: data.user,
        missionary: data.missionary,
        workAddress: data.workAddress,
        missionaryAgency,
        faithCommunity,
      };
      return NextResponse.json({ data: payload });
    }
  );
}

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
