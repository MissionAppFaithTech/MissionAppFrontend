import { NextResponse } from 'next/server';
import { z } from 'zod';
import { backendFetch } from '@/lib/api/backend';
import { readJsonBody, withSession } from '@/lib/api/bff';
import type { BackendMediaAsset, BackendMediaUpload } from '@/types/backend';

const MAX_COVER_BYTES = 10 * 1024 * 1024;

const requestUploadSchema = z.object({
  purpose: z.literal('IMPACT_PROJECT_COVER'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  fileSizeBytes: z.number().int().positive().max(MAX_COVER_BYTES),
});

/** Reserves an upload and returns the presigned PUT URL (the file never passes through the BFF). */
export async function POST(request: Request) {
  const body = await readJsonBody(request, requestUploadSchema, 'Arquivo inválido');
  if (!body.ok) return body.response;

  return withSession(
    'api/media-assets/uploads',
    'Não foi possível preparar o envio da imagem',
    async (accessToken) => {
      const result = await backendFetch<{
        data: { mediaAsset: BackendMediaAsset; upload: BackendMediaUpload };
      }>('/media-assets/uploads', { method: 'POST', body: body.data, accessToken });
      return NextResponse.json({ data: result.data });
    }
  );
}
