import { updateAccountProfileAction } from '@/app/actions/account';
import { completeMediaUploadAction, requestProfilePictureUploadAction } from '@/app/actions/media';
import { callAction } from '@/lib/api/callAction';
import { ApiError } from '@/lib/api/client';
import { PROFILE_PICTURE_MAX_BYTES, PROFILE_PICTURE_MIME_TYPES } from '@/lib/profilePicture';

/** `accept` of the file input: only what the backend takes for a profile picture. */
export const PROFILE_PICTURE_ACCEPT = PROFILE_PICTURE_MIME_TYPES.join(',');

const UPLOAD_FAILED = 'Não foi possível enviar a foto. Verifique sua conexão e tente novamente.';

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
 * @returns The public URL, or `null` while the backend still compresses the image.
 * @throws ApiError with a pt-BR message.
 */
export async function uploadProfilePicture(file: File): Promise<{ url: string | null }> {
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
  return { url: user.profilePictureUrl ?? null };
}

/** Removes the profile picture (`profilePictureId: null`). */
export async function removeProfilePicture(): Promise<void> {
  await callAction(() => updateAccountProfileAction({ profilePictureId: null }));
}
