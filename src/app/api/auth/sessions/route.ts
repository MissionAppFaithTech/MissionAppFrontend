import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';
import { withSession } from '@/lib/api/bff';
import type { ActiveSession } from '@/services/auth.service';

export async function GET() {
  return withSession(
    'api/auth/sessions GET',
    'Não foi possível carregar as sessões',
    async (accessToken) => {
      const result = await backendFetch<{ data: ActiveSession[] }>('/auth/sessions', {
        accessToken,
      });
      return NextResponse.json({ data: result.data });
    }
  );
}
