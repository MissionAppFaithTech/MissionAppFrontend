import { ApiError } from '@/lib/api/client';

/** Visible label of each registration field, used by the error summary. */
export const REGISTER_FIELD_LABELS: Record<string, string> = {
  fullName: 'Nome completo',
  email: 'E-mail',
  birthDate: 'Data de nascimento',
  gender: 'Gênero',
  document: 'CPF ou passaporte',
  phone: 'Telefone',
  missionaryAgency: 'Agência missionária',
  missionDescription: 'Projeto ou atuação missionária',
  faithCommunity: 'Comunidade de fé',
  username: 'Nome de usuário',
  password: 'Senha',
  confirmPassword: 'Confirmar senha',
};

/** `POST /accounts` and `POST /accounts/missionaries` field → registration form field. */
const SIGNUP_FIELDS: Record<string, string> = {
  fullName: 'fullName',
  email: 'email',
  phoneNumber: 'phone',
  gender: 'gender',
  birthDate: 'birthDate',
  identityType: 'document',
  identityDocument: 'document',
  username: 'username',
  password: 'password',
  passwordConfirmation: 'confirmPassword',
};

/** Fields typed in the first step ("Dados pessoais") of both wizards. */
const PERSONAL_FIELDS = new Set(['fullName', 'email', 'phone', 'gender', 'birthDate', 'document']);

/** Field errors the API returned for the signup, keyed by form field. */
export function signupFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  return Object.fromEntries(
    Object.entries(error.fieldErrors)
      .filter(([field]) => field in SIGNUP_FIELDS)
      .map(([field, message]) => [SIGNUP_FIELDS[field], message])
  );
}

/**
 * `POST /accounts/missionaries` fields of the "Dados ministeriais" step. A new
 * agency or community comes as an object, so its errors arrive as
 * `missionaryAgency.name`, `faithCommunity.pastorPhone`...
 */
const MINISTRY_FIELDS: [prefix: string, field: string, newItemLabel?: string][] = [
  ['missionaryAgencyId', 'missionaryAgency'],
  ['missionaryAgency', 'missionaryAgency', 'Nova agência'],
  ['faithCommunityId', 'faithCommunity'],
  ['faithCommunity', 'faithCommunity', 'Nova comunidade de fé'],
  ['aboutMe', 'missionDescription'],
];

/** Field errors of the "Dados ministeriais" step, keyed by form field. */
export function ministryStepErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const result: Record<string, string> = {};
  for (const [apiField, message] of Object.entries(error.fieldErrors)) {
    const match = MINISTRY_FIELDS.find(
      ([prefix, , newItemLabel]) =>
        apiField === prefix || (newItemLabel && apiField.startsWith(`${prefix}.`))
    );
    if (!match || result[match[1]]) continue;
    const [prefix, field, newItemLabel] = match;
    result[field] = apiField === prefix || !newItemLabel ? message : `${newItemLabel}: ${message}`;
  }
  return result;
}

/** The errors that belong to the "Dados pessoais" step. */
export function personalStepErrors(errors: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(errors).filter(([field]) => PERSONAL_FIELDS.has(field)));
}

/** The errors left for the next steps once "Dados pessoais" is done. */
export function laterStepErrors(errors: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(errors).filter(([field]) => !PERSONAL_FIELDS.has(field))
  );
}

/** React Hook Form `errors` option built from server messages. */
export function toFormErrors(errors: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(errors).map(([field, message]) => [field, { type: 'server', message }])
  );
}
