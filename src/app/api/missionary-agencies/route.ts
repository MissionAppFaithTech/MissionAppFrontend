import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';
import { bffErrorResponse } from '@/lib/api/bff';
import { normalizeCatalogList } from '@/lib/api/catalog';

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
