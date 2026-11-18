import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';
import { withSession } from '@/lib/api/bff';
import { postListSchema, postsResponseSchema } from '@/schemas/post.schema';

export async function GET(request: Request) {
  const parsed = postListSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success)
    return NextResponse.json({ message: 'Filtros de postagens inválidos' }, { status: 422 });
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(parsed.data))
    if (value !== undefined) params.set(key, String(value));
  return withSession(
    'api/posts GET',
    'Não foi possível carregar as postagens',
    async (accessToken) => {
      const result = await backendFetch(`/posts?${params}`, { accessToken });
      return NextResponse.json(postsResponseSchema.parse(result));
    }
  );
}
