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

/** The errors that belong to the "Dados pessoais" step. */
export function personalStepErrors(errors: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(errors).filter(([field]) => PERSONAL_FIELDS.has(field)));
}

/** React Hook Form `errors` option built from server messages. */
export function toFormErrors(errors: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(errors).map(([field, message]) => [field, { type: 'server', message }])
  );
}
