import { z } from 'zod';

export const impactProjectEditSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'O título deve ter no mínimo 3 caracteres')
    .max(120, 'O título deve ter no máximo 120 caracteres'),
  description: z.string().trim().min(5, 'A descrição deve ter no mínimo 5 caracteres'),
  bannerUrl: z.string(),
  videoUrl: z.string(),
  galleryImages: z.array(z.string()),
});

export type ImpactProjectEditFormData = z.infer<typeof impactProjectEditSchema>;

export const newPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Escreva o conteúdo da publicação')
    .max(3000, 'A publicação não pode ultrapassar 3000 caracteres'),
  youtubeUrl: z.string(),
  images: z.array(z.string()),
});

export type NewPostFormData = z.infer<typeof newPostSchema>;
