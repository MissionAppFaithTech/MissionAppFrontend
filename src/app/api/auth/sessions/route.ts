import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';
import { withSession } from '@/lib/api/bff';

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
