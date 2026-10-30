const TAKEN_FIELD_LABELS: Record<string, string> = {
  email: 'e-mail',
  username: 'nome de usuário',
  phoneNumber: 'telefone',
  phone_number: 'telefone',
};

const EXACT_API_MESSAGES_PT: Record<string, string> = {
  'The email has already been taken': 'Este e-mail já está em uso',
  'The username has already been taken': 'Este nome de usuário já está em uso',
  'Invalid user credentials':
    'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
  'invalid user credentials':
    'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
  'Invalid credentials':
    'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
  'invalid credentials':
    'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
  E_INVALID_CREDENTIALS:
    'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
  'Account is locked':
    'Sua conta foi temporariamente bloqueada. Tente novamente mais tarde ou redefina sua senha.',
  'Account locked':
    'Sua conta foi temporariamente bloqueada. Tente novamente mais tarde ou redefina sua senha.',
  'Too many login attempts':
    'Muitas tentativas incorretas. Aguarde alguns minutos antes de tentar novamente.',
  'User not found': 'Não encontramos nenhuma conta com o e-mail informado.',
  Unauthorized: 'Acesso não autorizado. Por favor, realize o login novamente.',
  Unauthenticated: 'Sessão expirada. Por favor, realize o login novamente.',
};

/**
 * Turns English Vine/Lucid/AdonisJS messages into user-friendly pt-BR copy shown in the UI.
 */
export function localizeApiErrorMessage(message: string): string {
  const trimmed = message.trim();
  const exact = EXACT_API_MESSAGES_PT[trimmed];
  if (exact) return exact;

  if (/invalid.*credentials/i.test(trimmed)) {
    return 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.';
  }

  const taken = /^The (.+) has already been taken$/i.exec(trimmed);
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
