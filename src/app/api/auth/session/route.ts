import { NextResponse } from 'next/server';
import { withSession } from '@/lib/api/bff';
import { decodeAccessToken } from '@/lib/auth/jwt';
import type { SessionInfo } from '@/types/backend';

const ROLES = new Set(['ADMIN', 'MISSIONARY', 'SUPPORTER']);

/** Who is logged in (id + role from the access token) without exposing the token. */
export async function GET() {
  return withSession('api/auth/session', 'Não foi possível verificar a sessão', async (token) => {
    const claims = decodeAccessToken(token);
    const role = claims?.role && ROLES.has(claims.role) ? claims.role : null;
    const data: SessionInfo = {
      authenticated: true,
      userId: claims?.sub ?? null,
      role: role as SessionInfo['role'],
    };
    return NextResponse.json({ data });
  });
}
