import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';
import { bffErrorResponse } from '@/lib/api/bff';
import { normalizeCatalogList } from '@/lib/api/catalog';

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
