'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import {
  profilePictureError,
  removeProfilePicture,
  uploadProfilePicture,
} from '@/services/profilePicture.service';

export type ProfilePictureStatus = 'idle' | 'uploading' | 'processing' | 'saved' | 'removing';

/** Status copy for a polite live region, in pt-BR. */
export const PROFILE_PICTURE_STATUS_MESSAGES: Record<ProfilePictureStatus, string> = {
  idle: '',
  uploading: 'Enviando foto de perfil...',
  processing: 'Foto enviada. Ela aparece para todos assim que o processamento terminar.',
  saved: 'Foto de perfil atualizada.',
  removing: 'Removendo foto de perfil...',
};

type Options = {
  /** URL of the photo already saved (from the profile). */
  currentUrl?: string;
  /** Called with the pt-BR message after a successful upload or removal. */
  onSuccess?: (message: string) => void;
  /** Called with the pt-BR message when a file is refused or the upload fails. */
  onError?: (message: string) => void;
};

/**
 * Profile picture upload for the owner's avatar. The file goes from the browser
 * straight to the storage; while the backend compresses it (URL still `null`)
 * the local preview stays on screen.
 */
export function useProfilePictureUpload({ currentUrl, onSuccess, onError }: Options = {}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [status, setStatus] = useState<ProfilePictureStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const fail = (message: string) => {
    setError(message);
    setStatus('idle');
    onError?.(message);
  };

  const selectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Lets the user pick the same file again after an error.
    event.target.value = '';
    if (!file || status === 'uploading' || status === 'removing') return;

    const invalid = profilePictureError(file);
    if (invalid) return fail(invalid);

    setError(null);
    setStatus('uploading');
    setPreview(URL.createObjectURL(file));
    try {
      const { url } = await uploadProfilePicture(file);
      setRemoved(false);
      if (url) {
        setUploadedUrl(url);
        setPreview(null);
      }
      const done: ProfilePictureStatus = url ? 'saved' : 'processing';
      setStatus(done);
      onSuccess?.(PROFILE_PICTURE_STATUS_MESSAGES[done]);
    } catch (uploadError) {
      setPreview(null);
      fail(uploadError instanceof Error ? uploadError.message : 'Não foi possível enviar a foto.');
    }
  };

  const remove = async () => {
    if (status === 'uploading' || status === 'removing') return;
    setError(null);
    setStatus('removing');
    try {
      await removeProfilePicture();
      setPreview(null);
      setUploadedUrl(null);
      setRemoved(true);
      setStatus('idle');
      onSuccess?.('Foto de perfil removida.');
    } catch (removeError) {
      fail(removeError instanceof Error ? removeError.message : 'Não foi possível remover a foto.');
    }
  };

  const photoUrl = preview ?? uploadedUrl ?? (removed ? undefined : currentUrl) ?? undefined;

  return {
    photoUrl,
    status,
    error,
    busy: status === 'uploading' || status === 'removing',
    statusMessage: PROFILE_PICTURE_STATUS_MESSAGES[status],
    selectFile,
    remove,
  };
}
