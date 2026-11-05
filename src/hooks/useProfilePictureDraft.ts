'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { profilePictureError } from '@/services/profilePicture.service';
import type { PictureChange } from '@/services/profileSave.service';

/** Photo change kept in an edit form until "Salvar". */
export type ProfilePictureDraft =
  { kind: 'keep' } | { kind: 'replace'; file: File; previewUrl: string } | { kind: 'remove' };

const KEEP: ProfilePictureDraft = { kind: 'keep' };

/**
 * Photo picker state of the edit forms: choosing or removing a photo only
 * stages the change (with a local preview). The form applies it on "Salvar"
 * (`change`) and drops it on "Cancelar" (`reset`).
 *
 * @param currentUrl Photo saved on the account.
 */
export function useProfilePictureDraft(currentUrl?: string) {
  const [draft, setDraft] = useState<ProfilePictureDraft>(KEEP);
  const [error, setError] = useState<string | null>(null);

  // Frees the preview when it is replaced, dropped or the form unmounts.
  useEffect(() => {
    if (draft.kind !== 'replace') return;
    const { previewUrl } = draft;
    return () => URL.revokeObjectURL(previewUrl);
  }, [draft]);

  const select = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Lets the user pick the same file again after an error or a cancel.
    event.target.value = '';
    if (!file) return;

    const invalid = profilePictureError(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setDraft({ kind: 'replace', file, previewUrl: URL.createObjectURL(file) });
  };

  /** Without a saved photo, removing a staged one just goes back to nothing. */
  const remove = () => {
    setError(null);
    setDraft(currentUrl ? { kind: 'remove' } : KEEP);
  };

  const reset = () => {
    setError(null);
    setDraft(KEEP);
  };

  const photoUrl =
    draft.kind === 'replace' ? draft.previewUrl : draft.kind === 'remove' ? undefined : currentUrl;

  const change: PictureChange | undefined =
    draft.kind === 'replace'
      ? { kind: 'replace', file: draft.file }
      : draft.kind === 'remove'
        ? { kind: 'remove' }
        : undefined;

  return { draft, photoUrl, error, dirty: draft.kind !== 'keep', change, select, remove, reset };
}

export type ProfilePictureDraftState = ReturnType<typeof useProfilePictureDraft>;
