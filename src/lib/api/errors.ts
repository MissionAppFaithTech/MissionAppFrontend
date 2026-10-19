const TAKEN_FIELD_LABELS: Record<string, string> = {
  email: 'e-mail',
  username: 'nome de usuário',
  phoneNumber: 'telefone',
  phone_number: 'telefone',
};

const EXACT_API_MESSAGES_PT: Record<string, string> = {
  'The email has already been taken': 'Este e-mail já está em uso',
  'The username has already been taken': 'Este nome de usuário já está em uso',
};

/**
 * Turns English Vine/Lucid unique messages into the pt-BR copy shown in the UI.
 */
export function localizeApiErrorMessage(message: string): string {
  const exact = EXACT_API_MESSAGES_PT[message];
  if (exact) return exact;

  const taken = /^The (.+) has already been taken$/i.exec(message.trim());
  if (taken?.[1]) {
    const label = TAKEN_FIELD_LABELS[taken[1]] ?? taken[1];
    return `Este ${label} já está em uso`;
  }

  return message;
}

export function extractErrorMessage(body: unknown, fallback: string): string {
  if (typeof body !== 'object' || body === null) return localizeApiErrorMessage(fallback);

  if ('message' in body && typeof (body as { message: unknown }).message === 'string') {
    return localizeApiErrorMessage((body as { message: string }).message);
  }

  if ('errors' in body && Array.isArray((body as { errors: unknown }).errors)) {
    const first = (body as { errors: Array<{ message?: string }> }).errors[0];
    if (first?.message) return localizeApiErrorMessage(first.message);
  }

  return localizeApiErrorMessage(fallback);
}
