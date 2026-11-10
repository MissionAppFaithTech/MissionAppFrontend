import {
  completeMediaUploadAction,
  getMediaAssetAction,
  requestProfilePictureUploadAction,
} from '@/app/actions/media';
import { callAction } from '@/lib/api/callAction';
import { ApiError } from '@/lib/api/client';
import { PROFILE_PICTURE_MAX_BYTES, PROFILE_PICTURE_MIME_TYPES } from '@/lib/profilePicture';
import { updateHeader } from '@/services/profile.service';

/** `accept` of the file input: only what the backend takes for a profile picture. */
export const PROFILE_PICTURE_ACCEPT = PROFILE_PICTURE_MIME_TYPES.join(',');

const UPLOAD_FAILED = 'Não foi possível enviar a foto. Verifique sua conexão e tente novamente.';
const PROCESSING_FAILED = 'Não foi possível processar a imagem. Tente enviar outra foto.';

/** `ApiError.code` of an image the backend worker could not process. */
export const PICTURE_PROCESSING_FAILED_CODE = 'PICTURE_PROCESSING_FAILED';

/**
 * Waits between checks while the backend worker compresses the image (~30 s in
 * total). Past that the photo is still saved: it shows up once processed.
 */
export const PROCESSING_POLL_DELAYS_MS = [500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000];

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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
 * Sends the file to the storage without linking it to the account: reserves
 * the upload, `PUT`s the file straight from the browser and confirms it. The
 * caller links it with `PATCH /account/profile { profilePictureId }`.
 *
 * @returns The id of the confirmed media asset.
 * @throws ApiError with a pt-BR message.
 */
export async function uploadPictureFile(file: File): Promise<string> {
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
  return id;
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
    if (asset.status === 'FAILED') {
      throw new ApiError(PROCESSING_FAILED, 422, {}, PICTURE_PROCESSING_FAILED_CODE);
    }
  }
  return null;
}

/** Longest side, in pixels, of the photo sent to the backend. */
export const PICTURE_MAX_SIDE_PX = 1600;
/** Files above this size are re-encoded even when they are small in pixels. */
export const PICTURE_REENCODE_ABOVE_BYTES = 1024 * 1024;
const PICTURE_JPEG_QUALITY = 0.85;

/** Why a chosen file cannot become the profile picture. */
export type PictureFileProblem = 'invalid-file' | 'unreadable' | 'too-large';

/** The chosen file cannot be used: the user has to pick another one. */
export class PictureFileError extends Error {
  constructor(public problem: PictureFileProblem) {
    super(problem);
    this.name = 'PictureFileError';
  }
}

/** Type and emptiness check done as soon as the file is chosen. */
export function pictureFileProblem(file: File): PictureFileProblem | null {
  if (!(PROFILE_PICTURE_MIME_TYPES as readonly string[]).includes(file.type)) return 'invalid-file';
  if (file.size === 0) return 'invalid-file';
  return null;
}

function encodeJpeg(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', PICTURE_JPEG_QUALITY));
}

/**
 * Shrinks a photo in the browser before the upload (RF 2.3, NF 2.1): phone
 * photos are often above the 5 MB the backend takes. Photos already small in
 * pixels and bytes go as they are.
 *
 * @throws PictureFileError when the file is not an image the browser can open
 * or is still too large after shrinking.
 */
export async function preparePictureFile(file: File): Promise<File> {
  const problem = pictureFileProblem(file);
  if (problem) throw new PictureFileError(problem);

  let prepared = file;
  // NOTE: browsers without `createImageBitmap` send the file as it is.
  if (typeof createImageBitmap === 'function') {
    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      throw new PictureFileError('unreadable');
    }
    const longest = Math.max(bitmap.width, bitmap.height);
    if (longest > PICTURE_MAX_SIDE_PX || file.size > PICTURE_REENCODE_ABOVE_BYTES) {
      const scale = Math.min(1, PICTURE_MAX_SIDE_PX / longest);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        bitmap.close();
        throw new PictureFileError('unreadable');
      }
      // JPEG has no transparency: without this a transparent PNG turns black.
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await encodeJpeg(canvas);
      if (blob && blob.size > 0 && blob.size < file.size) {
        const name = file.name.replace(/\.[^.]*$/, '') || 'foto';
        prepared = new File([blob], `${name}.jpg`, { type: 'image/jpeg' });
      }
    }
    bitmap.close();
  }

  if (prepared.size > PROFILE_PICTURE_MAX_BYTES) throw new PictureFileError('too-large');
  return prepared;
}

/** Step shown to the user while the photo is being sent. */
export type PictureSendStage = 'preparing' | 'uploading' | 'finishing';

/**
 * What a send already got done. The caller keeps it between attempts so that
 * "Tentar novamente" resumes instead of uploading the same file again.
 */
export type PictureSendProgress = {
  prepared?: File;
  assetId?: string;
  /** `null`: still processing after the last check. */
  processedUrl?: string | null;
};

/**
 * Changes the account's photo right away: shrinks the file, uploads it, waits
 * for the backend to process it and only then links it to the account, so the
 * previous photo stays in place until the new one is ready (and when anything
 * fails).
 *
 * @returns The new photo URL, or `null` when it is linked but still processing.
 * @throws PictureFileError or ApiError; see `pictureErrorScreen`.
 */
export async function changeProfilePicture(input: {
  file: File;
  progress?: PictureSendProgress;
  onStage?: (stage: PictureSendStage) => void;
}): Promise<{ url: string | null }> {
  const progress = input.progress ?? {};

  if (!progress.prepared) {
    input.onStage?.('preparing');
    progress.prepared = await preparePictureFile(input.file);
  }
  if (!progress.assetId) {
    input.onStage?.('uploading');
    progress.assetId = await uploadPictureFile(progress.prepared);
  }
  input.onStage?.('finishing');
  if (progress.processedUrl === undefined) {
    try {
      progress.processedUrl = await waitForProcessedPicture(progress.assetId);
    } catch (error) {
      // The asset is useless: another attempt has to start from the file.
      progress.assetId = undefined;
      throw error;
    }
  }

  try {
    const user = await updateHeader({ profilePictureId: progress.assetId });
    return { url: user.profilePictureUrl ?? progress.processedUrl ?? null };
  } catch (error) {
    // The backend no longer takes this asset (expired or purged): upload again.
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) {
      progress.assetId = undefined;
      progress.processedUrl = undefined;
    }
    throw error;
  }
}

/** Removes the account's photo right away. Throws `ApiError`. */
export async function removeProfilePicture(): Promise<void> {
  await updateHeader({ profilePictureId: null });
}

export type PictureErrorKind =
  PictureFileProblem | 'offline' | 'send-failed' | 'rate-limited' | 'processing-failed';

/** What the photo dialog shows when a send did not work. */
export type PictureErrorScreen = {
  kind: PictureErrorKind;
  title: string;
  message: string;
  /** Sending the same file again may work. */
  canRetry: boolean;
  /** Offers choosing another file. */
  canPickAnother: boolean;
};

const ERROR_SCREENS: Record<PictureErrorKind, Omit<PictureErrorScreen, 'kind'>> = {
  'invalid-file': {
    title: 'Não dá para usar este arquivo',
    message: 'Escolha uma foto em JPG, PNG ou WebP.',
    canRetry: false,
    canPickAnother: true,
  },
  unreadable: {
    title: 'Não conseguimos abrir esta imagem',
    message: 'Escolha outra foto.',
    canRetry: false,
    canPickAnother: true,
  },
  'too-large': {
    title: 'Esta foto é grande demais',
    message: 'Escolha uma foto menor.',
    canRetry: false,
    canPickAnother: true,
  },
  offline: {
    title: 'Sem conexão com a internet',
    message: 'Verifique seu Wi‑Fi ou seus dados móveis e tente de novo.',
    canRetry: true,
    canPickAnother: false,
  },
  'send-failed': {
    title: 'Não foi possível enviar a foto',
    message: 'Tente novamente em instantes.',
    canRetry: true,
    canPickAnother: true,
  },
  'rate-limited': {
    title: 'Muitas tentativas seguidas',
    message: 'Aguarde um minuto e tente de novo.',
    canRetry: true,
    canPickAnother: false,
  },
  'processing-failed': {
    title: 'Não conseguimos usar esta imagem',
    message: 'Escolha outra foto.',
    canRetry: false,
    canPickAnother: true,
  },
};

function pictureErrorKind(error: unknown): PictureErrorKind {
  if (error instanceof PictureFileError) return error.problem;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline';
  if (error instanceof ApiError) {
    if (error.code === PICTURE_PROCESSING_FAILED_CODE) return 'processing-failed';
    if (error.status === 0) return 'offline';
    if (error.status === 429) return 'rate-limited';
  }
  return 'send-failed';
}

/** Title, message and next steps for a failed photo send. */
export function pictureErrorScreen(error: unknown): PictureErrorScreen {
  const kind = pictureErrorKind(error);
  return { kind, ...ERROR_SCREENS[kind] };
}

/** The session ended during the send: the app's own logout flow takes over. */
export function isSessionExpired(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
