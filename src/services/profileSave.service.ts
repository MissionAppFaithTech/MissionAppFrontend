import {
  updateAbout,
  updateHeader,
  updatePublicContacts,
  type UpdateAboutPayload,
  type UpdateHeaderPayload,
  type UpdatePublicContactsPayload,
} from '@/services/profile.service';
import { uploadPictureFile, waitForProcessedPicture } from '@/services/profilePicture.service';
import type { FeedbackSeverity } from '@/stores/feedbackStore';
import type { WorkAddressData } from '@/types/profile';

const hasFields = (payload?: object) => Boolean(payload && Object.keys(payload).length > 0);

/** Photo change staged in an edit form; applied only when the form is saved. */
export type PictureChange = { kind: 'replace'; file: File } | { kind: 'remove' };

/** What happened to the photo when the form was saved. */
export type PictureOutcome = 'unchanged' | 'added' | 'replaced' | 'removed' | 'queued' | 'failed';

/**
 * Saves an edit form: the photo goes in the same `PATCH /account/profile` as
 * the name, username and bio (the file is uploaded to the storage first), then
 * the public contacts. A new photo is then waited for while the backend
 * compresses it.
 *
 * @returns The photo outcome; a processing failure is reported here, not
 * thrown, because the other changes are already saved.
 * @throws ApiError (with `fieldErrors` for the form) when nothing could be saved.
 */
export async function saveProfileEdits(input: {
  header?: UpdateHeaderPayload;
  contacts?: UpdatePublicContactsPayload;
  picture?: PictureChange;
  /** Whether the account had a photo before (added vs replaced). */
  hadPicture?: boolean;
  /** Called while waiting for the backend to compress a new photo. */
  onProcessing?: () => void;
}): Promise<{ picture: PictureOutcome }> {
  const header: UpdateHeaderPayload = { ...input.header };
  let assetId: string | null = null;
  if (input.picture?.kind === 'replace') {
    assetId = await uploadPictureFile(input.picture.file);
    header.profilePictureId = assetId;
  } else if (input.picture?.kind === 'remove') {
    header.profilePictureId = null;
  }

  const user = hasFields(header) ? await updateHeader(header) : undefined;
  if (hasFields(input.contacts)) await updatePublicContacts(input.contacts!);

  if (!input.picture) return { picture: 'unchanged' };
  if (input.picture.kind === 'remove') return { picture: 'removed' };

  if (!user?.profilePictureUrl) {
    input.onProcessing?.();
    try {
      if (!(await waitForProcessedPicture(assetId!))) return { picture: 'queued' };
    } catch {
      return { picture: 'failed' };
    }
  }
  return { picture: input.hadPicture ? 'replaced' : 'added' };
}

const PICTURE_ALONE: Partial<Record<PictureOutcome, string>> = {
  added: 'Foto de perfil adicionada com sucesso.',
  replaced: 'Foto de perfil atualizada com sucesso.',
  removed: 'Foto de perfil removida com sucesso.',
  queued: 'Foto de perfil enviada. Ela aparece assim que o processamento terminar.',
};

const PICTURE_WITH_FIELDS: Partial<Record<PictureOutcome, string>> = {
  added: 'Foto de perfil adicionada.',
  replaced: 'Foto de perfil atualizada.',
  removed: 'Foto de perfil removida.',
  queued: PICTURE_ALONE.queued,
};

/** Toast after saving an edit form: green when everything was saved, red when the photo failed. */
export function profileSaveFeedback({
  fieldsSaved,
  picture,
  fieldsMessage = 'Perfil atualizado com sucesso.',
}: {
  fieldsSaved: boolean;
  picture: PictureOutcome;
  fieldsMessage?: string;
}): { message: string; severity: FeedbackSeverity } {
  if (picture === 'failed') {
    return {
      message: fieldsSaved
        ? 'As demais alterações foram salvas, mas não foi possível processar a imagem. Tente enviar outra foto.'
        : 'Não foi possível processar a imagem. Tente enviar outra foto.',
      severity: 'error',
    };
  }
  const pictureMessage = (fieldsSaved ? PICTURE_WITH_FIELDS : PICTURE_ALONE)[picture];
  const message = [fieldsSaved ? fieldsMessage : null, pictureMessage].filter(Boolean).join(' ');
  return { message: message || fieldsMessage, severity: 'success' };
}

/**
 * Saves the "Sobre" fields, catalog links and work address in a single
 * `PATCH /missionaries/about`. Throws `ApiError`.
 */
export async function saveProfileAbout(input: {
  about?: UpdateAboutPayload;
  workAddress?: WorkAddressData;
}): Promise<void> {
  const payload: UpdateAboutPayload = {
    ...input.about,
    ...(input.workAddress ? { workAddress: input.workAddress } : {}),
  };
  if (hasFields(payload)) await updateAbout(payload);
}
