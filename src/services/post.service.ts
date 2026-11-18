import { createPostAction, updatePostAction, deletePostAction } from '@/app/actions/posts';
import { requestPostImageUploadAction, completeMediaUploadAction } from '@/app/actions/media';
import { callAction } from '@/lib/api/callAction';
import { bffRequest } from '@/lib/api/client';
import { uploadMediaFile } from '@/services/mediaUpload.service';
import {
  createPostSchema,
  updatePostSchema,
  postIdSchema,
  postListSchema,
  postsResponseSchema,
  postResponseSchema,
  postUploadSchema,
  type CreatePostInput,
  type UpdatePostInput,
  type PostListInput,
} from '@/schemas/post.schema';

export async function listPosts(input: PostListInput = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(postListSchema.parse(input)))
    if (value !== undefined) params.set(key, String(value));
  return postsResponseSchema.parse(
    await bffRequest(`/api/posts?${params}`, {
      fallbackMessage: 'Não foi possível carregar as postagens',
    })
  );
}
export async function getPost(id: string) {
  return postResponseSchema.parse(
    await bffRequest(`/api/posts/${postIdSchema.parse(id)}`, {
      fallbackMessage: 'Não foi possível carregar a postagem',
    })
  ).data.post;
}
export const createPost = (input: CreatePostInput) =>
  callAction(() => createPostAction(createPostSchema.parse(input)));
export const updatePost = (id: string, input: UpdatePostInput) =>
  callAction(() => updatePostAction(postIdSchema.parse(id), updatePostSchema.parse(input)));
export const deletePost = (id: string) =>
  callAction(() => deletePostAction(postIdSchema.parse(id)));

/** Keep this progress on retry: a confirmed asset must never be uploaded again. */
export type PostUploadProgress = { assetId?: string; uploaded?: boolean; confirmed?: boolean };
export async function uploadPostImage(file: File, progress: PostUploadProgress) {
  const input = postUploadSchema.parse({ mimeType: file.type, fileSizeBytes: file.size });
  if (!progress.uploaded) {
    const ticket = await callAction(() => requestPostImageUploadAction(input));
    await uploadMediaFile(file, ticket);
    progress.assetId = ticket.mediaAsset.id;
    progress.uploaded = true;
  }
  if (!progress.confirmed) {
    await callAction(() => completeMediaUploadAction(progress.assetId!));
    progress.confirmed = true;
  }
  return progress.assetId!;
}
