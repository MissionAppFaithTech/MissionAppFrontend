import { updateAccountProfileAction } from '@/app/actions/account';
import {
  completeMediaUploadAction,
  getMediaAssetAction,
  requestProfilePictureUploadAction,
} from '@/app/actions/media';
import { callAction } from '@/lib/api/callAction';
import { ApiError } from '@/lib/api/client';
import { PROFILE_PICTURE_MAX_BYTES, PROFILE_PICTURE_MIME_TYPES } from '@/lib/profilePicture';

/** `accept` of the file input: only what the backend takes for a profile picture. */
export const PROFILE_PICTURE_ACCEPT = PROFILE_PICTURE_MIME_TYPES.join(',');

const UPLOAD_FAILED = 'Não foi possível enviar a foto. Verifique sua conexão e tente novamente.';
const PROCESSING_FAILED = 'Não foi possível processar a imagem. Tente enviar outra foto.';

/**
 * Waits between checks while the backend worker compresses the image (~30 s in
 * total). Past that the photo is still saved: it shows up once processed.
 */
export const PROCESSING_POLL_DELAYS_MS = [500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000];

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export type UploadProfilePictureOptions = {
  /** Called once the file is stored and linked, while the backend still compresses it. */
  onProcessing?: () => void;
};

/** pt-BR reason the file cannot be a profile picture, or `null` when it can. */
export function profilePictureError(file: File): string | null {
  if (!(PROFILE_PICTURE_MIME_TYPES as readonly string[]).includes(file.type)) {
    return 'Escolha uma imagem JPG, PNG ou WebP para a foto de perfil.';
  }
  if (file.size === 0) return 'O arquivo escolhido está vazio. Escolha outra imagem.';
  if (file.size > PROFILE_PICTURE_MAX_BYTES) {
    return 'A foto de perfil deve ter no máximo 5 MB.';
  }
  return null;
}

/**
 * Uploads a new profile picture: reserves the upload, `PUT`s the file straight
 * to the storage from the browser, confirms it and links it to the account.
 *
 * Then waits for the backend to compress it (see {@link waitForProcessedPicture}).
 *
 * @returns The public URL, or `null` if the image is still being processed.
 * @throws ApiError with a pt-BR message.
 */
export async function uploadProfilePicture(
  file: File,
  { onProcessing }: UploadProfilePictureOptions = {}
): Promise<{ url: string | null }> {
  const invalid = profilePictureError(file);
  if (invalid) throw new ApiError(invalid, 422);

  const ticket = await callAction(() =>
    requestProfilePictureUploadAction({ mimeType: file.type, fileSizeBytes: file.size })
  );

  // NOTE: Content-Type and Content-Length are part of the signature. The browser
  // sets Content-Length from the File itself (scripts may not set it).
  const signedHeaders = Object.fromEntries(
    Object.entries(ticket.upload.headers ?? {}).filter(
      ([name]) => name.toLowerCase() !== 'content-length'
    )
  );
  let response: Response;
  try {
    response = await fetch(ticket.upload.url, {
      method: ticket.upload.method ?? 'PUT',
      headers: { 'Content-Type': file.type, ...signedHeaders },
      body: file,
    });
  } catch {
    throw new ApiError(UPLOAD_FAILED, 0);
  }
  if (!response.ok) throw new ApiError(UPLOAD_FAILED, response.status);

  const { id } = await callAction(() => completeMediaUploadAction(ticket.mediaAsset.id));
  const { user } = await callAction(() => updateAccountProfileAction({ profilePictureId: id }));
  if (user.profilePictureUrl) return { url: user.profilePictureUrl };

  onProcessing?.();
  return { url: await waitForProcessedPicture(id) };
}

/**
 * Polls `GET /media-assets/:id` until the backend worker finishes (`READY`).
 *
 * @returns The public URL, or `null` when it is still processing after the last
 * check (or a check failed: the upload itself already succeeded).
 * @throws ApiError when the backend could not process the image (`FAILED`).
 */
export async function waitForProcessedPicture(
  mediaAssetId: string,
  delays: readonly number[] = PROCESSING_POLL_DELAYS_MS
): Promise<string | null> {
  for (const delay of delays) {
    await sleep(delay);
    let asset;
    try {
      asset = await callAction(() => getMediaAssetAction(mediaAssetId));
    } catch {
      return null;
    }
    if (asset.status === 'READY' && asset.url) return asset.url;
    if (asset.status === 'FAILED') throw new ApiError(PROCESSING_FAILED, 422);
  }
  return null;
}

/** Removes the profile picture (`profilePictureId: null`). */
export async function removeProfilePicture(): Promise<void> {
  await callAction(() => updateAccountProfileAction({ profilePictureId: null }));
}
