'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
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
  /**
   * Account the photo belongs to. Next.js keeps a route's client state across
   * navigations, so after logging in as someone else the local photo of the
   * previous account must not survive.
   */
  ownerId?: string;
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
export function useProfilePictureUpload({ ownerId, currentUrl, onSuccess, onError }: Options = {}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [status, setStatus] = useState<ProfilePictureStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // The local photo (preview, upload, removal) only overrides the server's while
  // it describes the same account and the same saved photo: a new `currentUrl`
  // (after `router.refresh()`) or another account wins.
  const [source, setSource] = useState({ ownerId, currentUrl });
  if (source.ownerId !== ownerId || source.currentUrl !== currentUrl) {
    const ownerChanged = source.ownerId !== ownerId;
    setSource({ ownerId, currentUrl });
    setPreview(null);
    setUploadedUrl(null);
    setRemoved(false);
    if (ownerChanged) {
      setStatus('idle');
      setError(null);
    }
  }

  // A request that ends after switching accounts must not touch the new one.
  const ownerRef = useRef(ownerId);
  useEffect(() => {
    ownerRef.current = ownerId;
  }, [ownerId]);

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

    const owner = ownerId;
    const isCurrentOwner = () => ownerRef.current === owner;
    setError(null);
    setStatus('uploading');
    setPreview(URL.createObjectURL(file));
    // Once linked, the backend already discarded the previous photo.
    let linked = false;
    try {
      const { url } = await uploadProfilePicture(file, {
        onProcessing: () => {
          linked = true;
          if (isCurrentOwner()) setStatus('processing');
        },
      });
      if (!isCurrentOwner()) return;
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
      if (!isCurrentOwner()) return;
      setPreview(null);
      fail(uploadError instanceof Error ? uploadError.message : 'Não foi possível enviar a foto.');
      // The image failed processing after it replaced the old one: show what the server has.
      if (linked) router.refresh();
    }
  };

  const remove = async () => {
    if (isBusy(status)) return;
    const owner = ownerId;
    setError(null);
    setStatus('removing');
    try {
      await removeProfilePicture();
      if (ownerRef.current !== owner) return;
      setPreview(null);
      setUploadedUrl(null);
      setRemoved(true);
      setStatus('idle');
      onSuccess?.('Foto de perfil removida.');
      router.refresh();
    } catch (removeError) {
      if (ownerRef.current !== owner) return;
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
