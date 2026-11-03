import {
  updateAbout,
  updateHeader,
  updatePublicContacts,
  upsertWorkAddress,
  type UpdateAboutPayload,
  type UpdateHeaderPayload,
  type UpdatePublicContactsPayload,
} from '@/services/profile.service';
import type { WorkAddressData } from '@/types/profile';

const hasFields = (payload?: object) => Boolean(payload && Object.keys(payload).length > 0);

/**
 * Saves header fields, then public contacts. The page re-renders from the server
 * afterwards (`router.refresh()`, ADR-0005), so nothing is merged locally.
 * Throws `ApiError` with `fieldErrors` for the form.
 */
export async function saveProfileHeader(input: {
  header?: UpdateHeaderPayload;
  contacts?: UpdatePublicContactsPayload;
}): Promise<void> {
  if (hasFields(input.header)) await updateHeader(input.header!);
  if (hasFields(input.contacts)) await updatePublicContacts(input.contacts!);
}

/** Saves the "Sobre" fields, then the work address. Throws `ApiError`. */
export async function saveProfileAbout(input: {
  about?: UpdateAboutPayload;
  workAddress?: WorkAddressData;
}): Promise<void> {
  if (hasFields(input.about)) await updateAbout(input.about!);
  if (input.workAddress) await upsertWorkAddress(input.workAddress);
}
