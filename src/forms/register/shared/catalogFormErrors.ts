import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from '@/lib/api/client';

/** API field (backend payload) → field of the create-agency/church modals. */
const CATALOG_API_FIELDS: Record<string, string> = {
  name: 'name',
  addressLine1: 'address1',
  addressLine2: 'address2',
  city: 'city',
  state: 'state',
  country: 'country',
  postalCode: 'zipCode',
  website: 'website',
  pastorName: 'pastorName',
  pastorPhone: 'pastorPhone',
};

/**
 * Puts the API's field errors on the modal's inputs (the agency's phone is
 * `phone`, the church's `churchPhone`).
 *
 * @returns The message for the dialog's alert when no error could be placed on
 * a field, or `null` when every error went to its input.
 */
export function applyCatalogFieldErrors<Values extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<Values>,
  phoneField: 'phone' | 'churchPhone'
): string | null {
  const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};
  let placed = false;
  for (const [apiField, message] of Object.entries(fieldErrors)) {
    const field = apiField === 'phoneNumber' ? phoneField : CATALOG_API_FIELDS[apiField];
    if (!field) continue;
    setError(field as Path<Values>, { type: 'server', message }, { shouldFocus: !placed });
    placed = true;
  }
  if (placed) return null;
  return error instanceof Error ? error.message : 'Não foi possível salvar o cadastro.';
}
