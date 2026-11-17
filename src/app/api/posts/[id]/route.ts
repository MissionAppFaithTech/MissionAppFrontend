import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';
import { withSession } from '@/lib/api/bff';
import { postIdSchema, postResponseSchema } from '@/schemas/post.schema';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const parsed = postIdSchema.safeParse((await context.params).id);
  if (!parsed.success) return NextResponse.json({ message: 'Postagem inválida' }, { status: 422 });
  return withSession(
    'api/posts/id GET',
    'Não foi possível carregar a postagem',
    async (accessToken) => {
      return NextResponse.json(
        postResponseSchema.parse(await backendFetch(`/posts/${parsed.data}`, { accessToken }))
      );
    }
  );
}
