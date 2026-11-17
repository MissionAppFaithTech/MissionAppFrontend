'use server';

import { backendFetch } from '@/lib/api/backend';
import { parseInput, runWithSession } from '@/lib/server/action';
import {
  createPostSchema,
  updatePostSchema,
  postIdSchema,
  postResponseSchema,
} from '@/schemas/post.schema';

export async function createPostAction(input: unknown) {
  const parsed = parseInput(createPostSchema, input, 'Revise os campos da postagem');
  if (!parsed.ok) return parsed;
  return runWithSession(
    'actions/posts/create',
    'Não foi possível publicar',
    async (accessToken) => {
      const result = await backendFetch('/posts', {
        method: 'POST',
        body: parsed.data,
        accessToken,
      });
      return postResponseSchema.parse(result).data.post;
    }
  );
}
export async function updatePostAction(id: string, input: unknown) {
  const postId = parseInput(postIdSchema, id, 'Postagem inválida');
  if (!postId.ok) return postId;
  const parsed = parseInput(updatePostSchema, input, 'Revise os campos da postagem');
  if (!parsed.ok) return parsed;
  return runWithSession(
    'actions/posts/update',
    'Não foi possível salvar a postagem',
    async (accessToken) => {
      const result = await backendFetch(`/posts/${postId.data}`, {
        method: 'PATCH',
        body: parsed.data,
        accessToken,
      });
      return postResponseSchema.parse(result).data.post;
    }
  );
}
export async function deletePostAction(id: string) {
  const parsed = parseInput(postIdSchema, id, 'Postagem inválida');
  if (!parsed.ok) return parsed;
  return runWithSession(
    'actions/posts/delete',
    'Não foi possível excluir a postagem',
    async (accessToken) => {
      await backendFetch(`/posts/${parsed.data}`, { method: 'DELETE', accessToken });
      return { id: parsed.data };
    }
  );
}
