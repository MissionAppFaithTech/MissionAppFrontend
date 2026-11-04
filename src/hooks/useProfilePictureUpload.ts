'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  profilePictureError,
  removeProfilePicture,
  uploadProfilePicture,
} from '@/services/profilePicture.service';

export type ProfilePictureStatus =
  'idle' | 'uploading' | 'processing' | 'queued' | 'saved' | 'removing';

/** Status copy for a polite live region, in pt-BR. */
export const PROFILE_PICTURE_STATUS_MESSAGES: Record<ProfilePictureStatus, string> = {
  idle: '',
  uploading: 'Enviando foto de perfil...',
  processing: 'Processando a foto de perfil...',
  queued: 'Foto enviada. Ela aparece para todos assim que o processamento terminar.',
  saved: 'Foto de perfil atualizada.',
  removing: 'Removendo foto de perfil...',
};

/** Upload, processing check or removal in flight: the controls stay disabled. */
const isBusy = (status: ProfilePictureStatus) =>
  status === 'uploading' || status === 'processing' || status === 'removing';

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
 * the local preview stays on screen. After saving or removing, the server data
 * is refreshed (ADR-0005) so every page of the profile shows the new photo.
 */
export function useProfilePictureUpload({ currentUrl, onSuccess, onError }: Options = {}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [status, setStatus] = useState<ProfilePictureStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    if (!file || isBusy(status)) return;

    const invalid = profilePictureError(file);
    if (invalid) return fail(invalid);

    setError(null);
    setStatus('uploading');
    setPreview(URL.createObjectURL(file));
    // Once linked, the backend already discarded the previous photo.
    let linked = false;
    try {
      const { url } = await uploadProfilePicture(file, {
        onProcessing: () => {
          linked = true;
          setStatus('processing');
        },
      });
      setRemoved(false);
      if (url) {
        setUploadedUrl(url);
        setPreview(null);
      }
      const done: ProfilePictureStatus = url ? 'saved' : 'queued';
      setStatus(done);
      onSuccess?.(PROFILE_PICTURE_STATUS_MESSAGES[done]);
      router.refresh();
    } catch (uploadError) {
      setPreview(null);
      fail(uploadError instanceof Error ? uploadError.message : 'Não foi possível enviar a foto.');
      // The image failed processing after it replaced the old one: show what the server has.
      if (linked) router.refresh();
    }
  };

  const remove = async () => {
    if (isBusy(status)) return;
    setError(null);
    setStatus('removing');
    try {
      await removeProfilePicture();
      setPreview(null);
      setUploadedUrl(null);
      setRemoved(true);
      setStatus('idle');
      onSuccess?.('Foto de perfil removida.');
      router.refresh();
    } catch (removeError) {
      fail(removeError instanceof Error ? removeError.message : 'Não foi possível remover a foto.');
    }
  };

  const photoUrl = preview ?? uploadedUrl ?? (removed ? undefined : currentUrl) ?? undefined;

  return {
    photoUrl,
    status,
    error,
    busy: isBusy(status),
    statusMessage: PROFILE_PICTURE_STATUS_MESSAGES[status],
    selectFile,
    remove,
  };
}
