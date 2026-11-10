import {
  updateAbout,
  updateHeader,
  updatePublicContacts,
  type UpdateAboutPayload,
  type UpdateHeaderPayload,
  type UpdatePublicContactsPayload,
} from '@/services/profile.service';
import type { WorkAddressData } from '@/types/profile';

const hasFields = (payload?: object) => Boolean(payload && Object.keys(payload).length > 0);

/**
 * Saves an edit form: name, username and bio in `PATCH /account/profile`, then
 * the public contacts. The photo is not part of it: it is saved on its own,
 * right away (`changeProfilePicture`).
 *
 * @throws ApiError (with `fieldErrors` for the form) when nothing could be saved.
 */
export async function saveProfileEdits(input: {
  header?: UpdateHeaderPayload;
  contacts?: UpdatePublicContactsPayload;
}): Promise<void> {
  if (hasFields(input.header)) await updateHeader(input.header!);
  if (hasFields(input.contacts)) await updatePublicContacts(input.contacts!);
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
