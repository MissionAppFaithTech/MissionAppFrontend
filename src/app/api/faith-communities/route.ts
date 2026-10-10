import { NextResponse } from 'next/server';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import type { CatalogListResponse } from '@/services/catalog.service';

export async function GET() {
  try {
    const result = await backendFetch<CatalogListResponse>('/faith-communities');
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        typeof error.body === 'object' && error.body !== null
          ? error.body
          : { message: error.message },
        { status: error.status }
      );
    }

    console.error('[api/faith-communities]', error);
    return NextResponse.json(
      { message: 'Não foi possível carregar as comunidades de fé' },
      { status: 502 }
    );
  }
}
