import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';
import { withSession } from '@/lib/api/bff';
import { faithCommunityIdSchema } from '@/schemas/actions.schema';
import type { BackendFaithCommunity } from '@/types/backend';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const parsed = faithCommunityIdSchema.safeParse((await context.params).id);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Comunidade de fé inválida' }, { status: 422 });
  }
  return withSession(
    'api/faith-communities/id GET',
    'Não foi possível carregar os dados da comunidade de fé',
    async (accessToken) => {
      const result = await backendFetch<{ data: { faithCommunity: BackendFaithCommunity } }>(
        `/faith-communities/${encodeURIComponent(parsed.data)}`,
        { accessToken }
      );
      return NextResponse.json(result);
    }
  );
}
