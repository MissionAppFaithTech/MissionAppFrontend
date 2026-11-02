import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';
import { withSession } from '@/lib/api/bff';
import { clearAuthCookies } from '@/lib/auth/cookies';

export type SessionSummary = {
  id: string;
  deviceType: 'web' | 'mobile';
  deviceName: string | null;
  ipAddress: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  current: boolean;
};

export async function GET() {
  return withSession(
    'api/auth/sessions GET',
    'Não foi possível carregar as sessões',
    async (accessToken) => {
      const result = await backendFetch<{ data: SessionSummary[] }>('/auth/sessions', {
        accessToken,
      });
      return NextResponse.json({ data: result.data });
    }
  );
}

/** Ends every session, including this one, so the auth cookies are cleared too. */
export async function DELETE() {
  return withSession(
    'api/auth/sessions DELETE',
    'Não foi possível encerrar as sessões',
    async (accessToken) => {
      await backendFetch('/auth/sessions', { method: 'DELETE', accessToken });
      const response = NextResponse.json({ message: 'Todas as sessões foram encerradas.' });
      clearAuthCookies(response);
      return response;
    }
  );
}
