'use server';

import { backendFetch } from '@/lib/api/backend';
import { parseInput, runWithSession, type ActionResult } from '@/lib/server/action';
import { mediaAssetIdSchema, profilePictureUploadInputSchema } from '@/schemas/actions.schema';
import type { MediaAssetState, MediaUploadTicket } from '@/types/backend';

/**
 * Direct upload of media (backend `media_asset`). The file never passes through
 * the BFF: the browser `PUT`s it to the presigned URL these actions hand out.
 */

/** Reserves a `PROFILE_PICTURE` asset and returns where the browser sends the file. */
export async function requestProfilePictureUploadAction(input: {
  mimeType: string;
  fileSizeBytes: number;
}): Promise<ActionResult<MediaUploadTicket>> {
  const parsed = parseInput(
    profilePictureUploadInputSchema,
    input,
    'Envie uma imagem JPG, PNG ou WebP de até 5 MB'
  );
  if (!parsed.ok) return parsed;

  return runWithSession(
    'actions/media-uploads',
    'Não foi possível preparar o envio da foto',
    async (accessToken) => {
      const result = await backendFetch<{ data: MediaUploadTicket }>('/media-assets/uploads', {
        method: 'POST',
        body: { purpose: 'PROFILE_PICTURE', ...parsed.data },
        accessToken,
      });
      return result.data;
    }
  );
}

/** Confirms the `PUT` finished; the backend then compresses the image (202). */
export async function completeMediaUploadAction(
  mediaAssetId: string
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseInput(mediaAssetIdSchema, mediaAssetId, 'Arquivo inválido');
  if (!parsed.ok) return parsed;

  return runWithSession(
    'actions/media-upload-completion',
    'Não foi possível confirmar o envio da foto',
    async (accessToken) => {
      await backendFetch(`/media-assets/${encodeURIComponent(parsed.data)}/completion`, {
        method: 'POST',
        body: {},
        accessToken,
      });
      return { id: parsed.data };
    }
  );
}

/**
 * Reads the asset's processing state. `url` stays `null` until the backend
 * worker finishes compressing the image (`status: 'READY'`).
 */
export async function getMediaAssetAction(
  mediaAssetId: string
): Promise<ActionResult<MediaAssetState>> {
  const parsed = parseInput(mediaAssetIdSchema, mediaAssetId, 'Arquivo inválido');
  if (!parsed.ok) return parsed;

  return runWithSession(
    'actions/media-asset',
    'Não foi possível verificar o processamento da foto',
    async (accessToken) => {
      const result = await backendFetch<{ data: { mediaAsset: MediaAssetState } }>(
        `/media-assets/${encodeURIComponent(parsed.data)}`,
        { accessToken }
      );
      const { id, status, url } = result.data.mediaAsset;
      return { id, status, url: url ?? null };
    }
  );
}
