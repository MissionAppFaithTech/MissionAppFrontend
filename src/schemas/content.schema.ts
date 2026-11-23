import { z } from 'zod';
import { getVideoEmbedUrl } from '@/lib/youtube';

export const impactProjectEditSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Informe o título do projeto')
    .max(255, 'O título deve ter no máximo 255 caracteres'),
  description: z
    .string()
    .trim()
    .min(1, 'Informe a descrição do projeto')
    .max(10000, 'A descrição deve ter no máximo 10000 caracteres'),
  videoUrl: z
    .string()
    .trim()
    .refine((value) => value === '' || getVideoEmbedUrl(value) !== null, {
      message: 'Use um link do YouTube ou do Vimeo',
    }),
});

export type ImpactProjectEditFormData = z.infer<typeof impactProjectEditSchema>;
