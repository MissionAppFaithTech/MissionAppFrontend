'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  changeProfilePicture,
  isSessionExpired,
  pictureErrorScreen,
  pictureFileProblem,
  PictureFileError,
  removeProfilePicture,
  type PictureErrorScreen,
  type PictureSendProgress,
  type PictureSendStage,
} from '@/services/profilePicture.service';
import { useFeedbackStore } from '@/stores/feedbackStore';

/** After this long the dialog tells the user the send is slow but still running. */
export const SLOW_SEND_AFTER_MS = 8000;

/** What the photo dialog is showing. */
export type PictureDialogView =
  | { view: 'closed' }
  | { view: 'confirm' }
  | { view: 'sending'; stage: PictureSendStage; slow: boolean }
  | { view: 'error'; screen: PictureErrorScreen };

/** State of the "Remover foto" confirmation. */
export type PictureRemovalView = 'closed' | 'confirm' | 'removing' | 'failed';

const CLOSED: PictureDialogView = { view: 'closed' };

/**
 * Photo of the edit forms, saved right away: choosing a file asks for a
 * confirmation with a preview, sends it while the dialog waits, and shows an
 * error screen when it does not work. Removing asks first too. Nothing here
 * depends on the form's "Salvar".
 *
 * @param currentUrl Photo saved on the account (server data).
 * @param accountId Owner of the photo: another account never sees what this
 * one chose or sent.
 */
export function useProfilePictureChange(currentUrl?: string, accountId?: string) {
  const router = useRouter();
  const notify = useFeedbackStore((s) => s.notify);

  const [dialog, setDialog] = useState<PictureDialogView>(CLOSED);
  const [removal, setRemoval] = useState<PictureRemovalView>('closed');
  const [chosen, setChosen] = useState<{ file: File; previewUrl: string } | null>(null);
  // Photo shown until the server data catches up: a URL, or `null` once removed.
  const [shown, setShown] = useState<{ url: string | null } | null>(null);
  const [seenUrl, setSeenUrl] = useState(currentUrl);
  const [seenAccount, setSeenAccount] = useState(accountId);
  const progress = useRef<PictureSendProgress>({});

  if (seenAccount !== accountId) {
    setSeenAccount(accountId);
    setSeenUrl(currentUrl);
    setShown(null);
    setChosen(null);
    setDialog(CLOSED);
    setRemoval('closed');
  }

  // The refreshed server data replaces the local photo, except while a new
  // photo is still processing (the server has no URL for it yet).
  if (seenUrl !== currentUrl) {
    setSeenUrl(currentUrl);
    if (shown && (shown.url === null || currentUrl)) setShown(null);
  }

  // Frees the preview when another file is chosen or the form unmounts.
  useEffect(() => {
    if (!chosen) return;
    const { previewUrl } = chosen;
    return () => URL.revokeObjectURL(previewUrl);
  }, [chosen]);

  const busy = dialog.view === 'sending' || removal === 'removing';

  // Closing or reloading the tab in the middle of a send asks first.
  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);

  const photoUrl = shown ? (shown.url ?? undefined) : currentUrl;
  const hadPicture = Boolean(photoUrl);

  const select = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Lets the user pick the same file again after an error or a cancel.
    event.target.value = '';
    if (!file || busy) return;

    progress.current = {};
    const problem = pictureFileProblem(file);
    if (problem) {
      setDialog({ view: 'error', screen: pictureErrorScreen(new PictureFileError(problem)) });
      return;
    }
    setChosen({ file, previewUrl: URL.createObjectURL(file) });
    setDialog({ view: 'confirm' });
  };

  /** Sends the chosen photo; also the "Tentar novamente" of the error screen. */
  const send = async () => {
    if (!chosen || busy) return;
    const replaced = hadPicture;
    setDialog({ view: 'sending', stage: 'preparing', slow: false });
    const slowTimer = setTimeout(
      () => setDialog((d) => (d.view === 'sending' ? { ...d, slow: true } : d)),
      SLOW_SEND_AFTER_MS
    );
    try {
      const { url } = await changeProfilePicture({
        file: chosen.file,
        progress: progress.current,
        onStage: (stage) => setDialog((d) => (d.view === 'sending' ? { ...d, stage } : d)),
      });
      progress.current = {};
      setShown({ url: url ?? chosen.previewUrl });
      setDialog(CLOSED);
      if (url) {
        notify(
          replaced
            ? 'Foto de perfil atualizada com sucesso.'
            : 'Foto de perfil adicionada com sucesso.'
        );
      } else {
        notify('Foto enviada. Ela aparece em instantes.', 'info');
      }
      // Brings the new photo to the navbar and the profile header (ADR-0005).
      router.refresh();
    } catch (error) {
      // The session ended: the app's logout flow already took over.
      setDialog(
        isSessionExpired(error) ? CLOSED : { view: 'error', screen: pictureErrorScreen(error) }
      );
    } finally {
      clearTimeout(slowTimer);
    }
  };

  /** Closes the dialog; ignored while a send is running. */
  const close = () => {
    if (dialog.view !== 'sending') setDialog(CLOSED);
  };

  const askRemoval = () => {
    if (!busy) setRemoval('confirm');
  };

  const cancelRemoval = () => {
    if (removal !== 'removing') setRemoval('closed');
  };

  const confirmRemoval = async () => {
    if (busy) return;
    setRemoval('removing');
    try {
      await removeProfilePicture();
      setShown({ url: null });
      setRemoval('closed');
      notify('Foto de perfil removida com sucesso.');
      router.refresh();
    } catch (error) {
      setRemoval(isSessionExpired(error) ? 'closed' : 'failed');
    }
  };

  return {
    /** Photo to show in the form. */
    photoUrl,
    /** Whether there is a photo that a failed send leaves untouched. */
    hadPicture,
    /** Preview of the chosen file. */
    previewUrl: chosen?.previewUrl,
    dialog,
    removal,
    busy,
    select,
    send,
    close,
    askRemoval,
    cancelRemoval,
    confirmRemoval,
  };
}

export type ProfilePictureChangeState = ReturnType<typeof useProfilePictureChange>;
