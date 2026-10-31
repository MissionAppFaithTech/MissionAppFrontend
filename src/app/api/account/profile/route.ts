import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { readJsonBody, withSession } from '@/lib/api/bff';
import { BIO_MAX_LENGTH } from '@/schemas/profile.schema';
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
  biography: z.string().trim().max(BIO_MAX_LENGTH).nullable().optional(),
});

type BackendProfileResponse = {
  data: {
    user: BackendUser;
    missionary: BackendMissionary | null;
    workAddress: BackendWorkAddress | null;
    /** Sent by the backend since MissionAppBackend#142; absent on older versions. */
    missionaryAgency?: NamedRef | null;
    faithCommunity?: NamedRef | null;
  };
};

type CatalogKey = 'missionaryAgency' | 'faithCommunity';

const CATALOG_PATHS: Record<CatalogKey, string> = {
  missionaryAgency: '/missionary-agencies',
  faithCommunity: '/faith-communities',
};

/**
 * Fallback for backends without #142: looks the name up in the public catalog.
 * A name is cosmetic, so any failure but an expired session (401, which
 * `withSession` turns into a refresh) leaves it empty instead of failing the profile.
 */
async function lookupName(key: CatalogKey, id: string, accessToken: string) {
  try {
    const result = await backendFetch<{ data: Partial<Record<CatalogKey, NamedRef>> }>(
      `${CATALOG_PATHS[key]}/${encodeURIComponent(id)}`,
      { accessToken }
    );
    const entry = result.data[key];
    return entry ? { id: entry.id, name: entry.name } : null;
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 401) throw error;
    if (!(error instanceof BackendApiError && error.status === 404)) {
      console.error(`[api/account/profile GET] ${key} name lookup failed`, error);
    }
    return null;
  }
}

async function catalogName(
  key: CatalogKey,
  provided: NamedRef | null | undefined,
  id: string | null | undefined,
  accessToken: string
): Promise<NamedRef | null> {
  if (provided !== undefined) return provided;
  return id ? lookupName(key, id, accessToken) : null;
}

export async function GET() {
  return withSession(
    'api/account/profile GET',
    'Não foi possível carregar o perfil',
    async (accessToken) => {
      const { data } = await backendFetch<BackendProfileResponse>('/account/profile', {
        accessToken,
      });

      const [missionaryAgency, faithCommunity] = await Promise.all([
        catalogName(
          'missionaryAgency',
          data.missionaryAgency,
          data.missionary?.missionaryAgencyId,
          accessToken
        ),
        catalogName(
          'faithCommunity',
          data.faithCommunity,
          data.missionary?.faithCommunityId,
          accessToken
        ),
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
