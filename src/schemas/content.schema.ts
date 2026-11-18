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
