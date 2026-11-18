import { z } from 'zod';

export const POST_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const POST_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const postIdSchema = z.uuidv7('Identificador inválido');
export const safeWebUrlSchema = z
  .url('Informe uma URL completa')
  .trim()
  .refine((value) => {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
    } catch {
      return false;
    }
  }, 'Use um link HTTP ou HTTPS sem credenciais');
const content = z
  .string()
  .trim()
  .min(1, 'Escreva a legenda da publicação')
  .max(5000, 'A legenda deve ter no máximo 5000 caracteres');
const highlightLink = safeWebUrlSchema.max(255, 'O link deve ter no máximo 255 caracteres');
const imageAssetIds = z
  .array(postIdSchema)
  .max(3, 'Escolha até 3 imagens')
  .refine((ids) => new Set(ids).size === ids.length, 'Não repita imagens');
export const createPostSchema = z
  .object({
    content,
    highlightLink: highlightLink.optional(),
    imageAssetIds: imageAssetIds.optional(),
    replaceOldestImages: z.boolean().optional(),
  })
  .strict();
export const updatePostSchema = createPostSchema
  .partial()
  .extend({ highlightLink: highlightLink.nullable().optional() })
  .strict();
export const postUploadSchema = z
  .object({
    mimeType: z.enum(POST_IMAGE_TYPES, { error: 'Escolha JPG, PNG ou WebP' }),
    fileSizeBytes: z
      .number()
      .int()
      .positive('O arquivo está vazio')
      .max(POST_IMAGE_MAX_BYTES, 'Cada imagem deve ter no máximo 10 MB'),
  })
  .strict();
export const postListSchema = z
  .object({
    missionaryId: postIdSchema.optional(),
    cursor: z.string().min(1).max(2048).optional(),
    limit: z.coerce.number().int().min(1).max(20).default(20),
  })
  .strict();
export const postMediaSchema = z.object({
  id: postIdSchema,
  status: z.enum(['PENDING_UPLOAD', 'PROCESSING', 'READY', 'FAILED']),
  url: z.string().nullable(),
});
export const postSchema = z.object({
  id: postIdSchema,
  missionaryId: postIdSchema,
  content: z.string(),
  highlightLink: z.string().nullable(),
  slug: z.string(),
  createdAt: z.string(),
  images: z.array(
    z.object({
      id: postIdSchema,
      order: z.number().int(),
      imageAssetId: postIdSchema,
      createdAt: z.string(),
      image: postMediaSchema,
    })
  ),
});
export const postResponseSchema = z.object({ data: z.object({ post: postSchema }) });
export const postsResponseSchema = z.object({
  data: z.object({ posts: z.array(postSchema) }),
  meta: z.object({ nextCursor: z.string().nullable(), hasMore: z.boolean() }),
});
export type Post = z.infer<typeof postSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostListInput = z.input<typeof postListSchema>;
