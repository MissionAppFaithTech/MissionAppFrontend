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
  'The current password is incorrect': 'A senha atual está incorreta.',
  'User not found': 'Não encontramos nenhuma conta com o e-mail informado.',
  Unauthorized: 'Acesso não autorizado. Por favor, realize o login novamente.',
  'Unauthorized access': 'Sua sessão expirou. Entre novamente para continuar.',
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

  return trimmed;
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

export type BffErrorBody = {
  message: string;
  /** Field name (backend camelCase) → pt-BR message, for react-hook-form `setError`. */
  fieldErrors?: Record<string, string>;
  /** Stable backend error code (`E_*`, backend ADR-0034), when the API sent one. */
  code?: string;
};

/**
 * pt-BR copy for backend codes whose `message` is English or too generic. Domain
 * codes not listed here already arrive with a specific pt-BR message.
 */
const CODE_MESSAGES_PT: Record<string, string> = {
  E_UNAUTHORIZED_ACCESS: 'Sua sessão expirou. Entre novamente para continuar.',
  E_INVALID_REFRESH_TOKEN: 'Sua sessão expirou. Entre novamente para continuar.',
  E_INVALID_CREDENTIALS:
    'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
  E_REFRESH_UNAVAILABLE: 'Não foi possível renovar sua sessão agora. Tente novamente em instantes.',
  E_SESSION_NOT_FOUND: 'Esta sessão já foi encerrada.',
  E_ROUTE_NOT_FOUND: 'Não encontramos o que você procurava.',
  E_ROW_NOT_FOUND: 'Não encontramos o que você procurava.',
  E_NOT_FOUND: 'Não encontramos o que você procurava.',
  E_FORBIDDEN: 'Você não tem permissão para realizar esta ação.',
  E_INVALID_CURSOR: 'Não foi possível carregar mais itens. Atualize a página e tente novamente.',
  E_INTERNAL_SERVER_ERROR: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
};

/** "alguns segundos", "1 minuto", "5 minutos" — rounded up. */
export function formatWait(seconds: number): string {
  if (seconds < 60) return 'alguns segundos';
  const minutes = Math.ceil(seconds / 60);
  return minutes === 1 ? '1 minuto' : `${minutes} minutos`;
}

/** Copy for codes that depend on how long the user must wait (`meta.retryAfterSeconds`). */
function waitMessage(code: string, retryAfterSeconds?: number): string | undefined {
  const wait =
    typeof retryAfterSeconds === 'number' && retryAfterSeconds > 0
      ? formatWait(retryAfterSeconds)
      : undefined;
  if (code === 'E_ACCOUNT_LOCKED') {
    return wait
      ? `Sua conta foi temporariamente bloqueada. Tente novamente em ${wait} ou redefina sua senha.`
      : STATUS_MESSAGES_PT[423];
  }
  if (code === 'E_TOO_MANY_REQUESTS') {
    return wait
      ? `Muitas tentativas em pouco tempo. Aguarde ${wait} e tente novamente.`
      : STATUS_MESSAGES_PT[429];
  }
  return undefined;
}

type EnvelopeFields = { code?: string; retryAfterSeconds?: number };

/** Reads `code` and `meta.retryAfterSeconds` from the backend envelope (ADR-0034). */
function envelopeFields(body: unknown): EnvelopeFields {
  if (typeof body !== 'object' || body === null) return {};
  const { code, meta } = body as { code?: unknown; meta?: { retryAfterSeconds?: unknown } };
  return {
    code: typeof code === 'string' && /^E_[A-Z0-9_]+$/.test(code) ? code : undefined,
    retryAfterSeconds:
      typeof meta?.retryAfterSeconds === 'number' ? meta.retryAfterSeconds : undefined,
  };
}

const STATUS_MESSAGES_PT: Record<number, string> = {
  401: 'Sua sessão expirou. Entre novamente para continuar.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Não encontramos o que você procurava.',
  409: 'Esta ação entra em conflito com dados já existentes.',
  422: 'Revise os campos destacados e tente novamente.',
  423: 'Sua conta foi temporariamente bloqueada. Tente novamente mais tarde ou redefina sua senha.',
  429: 'Muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente.',
};

/** Backend `{ message }` errors that belong to a single form field. */
const MESSAGE_FIELDS: Record<string, string> = {
  'Nome de usuário já está em uso': 'username',
  'Comunidade de fé informada não existe': 'faithCommunityId',
};

type VineFieldError = {
  field?: unknown;
  message?: unknown;
  rule?: unknown;
  meta?: Record<string, unknown>;
};

/** Turns a VineJS field error (English default copy) into pt-BR. */
export function localizeFieldError(error: VineFieldError): string {
  const meta = error.meta ?? {};
  switch (error.rule) {
    case 'required':
      return 'Campo obrigatório.';
    case 'maxLength':
      return `Use no máximo ${String(meta.max)} caracteres.`;
    case 'minLength':
      return `Use pelo menos ${String(meta.min)} caracteres.`;
    case 'email':
      return 'Informe um e-mail válido.';
    case 'regex':
      return 'Formato inválido.';
    case 'uuid':
      return 'Identificador inválido.';
    case 'enum':
      return 'Selecione uma opção válida.';
    case 'database.unique':
    case 'unique':
      return 'Este valor já está em uso.';
    default:
      return typeof error.message === 'string'
        ? localizeApiErrorMessage(error.message)
        : 'Valor inválido.';
  }
}

/**
 * Normalizes every backend error into `{ message, fieldErrors?, code? }`. The
 * envelope `{ message, code, errors?, meta? }` (backend ADR-0034) is read by
 * `code` first; older shapes (`{ errors }`, `{ message }`, plain text) still work.
 */
export function toBffError(status: number, body: unknown, fallback: string): BffErrorBody {
  const { code, retryAfterSeconds } = envelopeFields(body);
  const result = toBffErrorBody(status, body, fallback, code, retryAfterSeconds);
  return code ? { ...result, code } : result;
}

function toBffErrorBody(
  status: number,
  body: unknown,
  fallback: string,
  code: string | undefined,
  retryAfterSeconds: number | undefined
): BffErrorBody {
  const statusMessage = STATUS_MESSAGES_PT[status];
  const waited = code ? waitMessage(code, retryAfterSeconds) : undefined;
  if (waited) return { message: waited };
  // Rate-limit bodies are generic English text: the pt-BR status copy says it better.
  if (status === 429) return { message: STATUS_MESSAGES_PT[429] };

  if (typeof body === 'object' && body !== null) {
    const errors = (body as { errors?: unknown }).errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const fieldErrors: Record<string, string> = {};
      let firstMessage: string | undefined;

      for (const raw of errors as VineFieldError[]) {
        // Prefer a known full translation ("Este e-mail já está em uso") over the rule copy.
        const known =
          typeof raw.message === 'string' ? localizeApiErrorMessage(raw.message) : undefined;
        const localized =
          typeof raw.field !== 'string'
            ? undefined
            : known && known !== raw.message
              ? known
              : localizeFieldError(raw);
        if (typeof raw.field === 'string' && localized && !fieldErrors[raw.field]) {
          fieldErrors[raw.field] = localized;
        }
        if (!firstMessage && typeof raw.message === 'string' && typeof raw.field !== 'string') {
          firstMessage = localizeApiErrorMessage(raw.message);
        }
      }

      const fieldMessages = Object.values(fieldErrors);
      if (fieldMessages.length === 1) return { message: fieldMessages[0], fieldErrors };
      if (fieldMessages.length > 1) return { message: statusMessage ?? fallback, fieldErrors };
      if (firstMessage) return { message: firstMessage };
    }

    const coded = code ? CODE_MESSAGES_PT[code] : undefined;
    if (coded) return { message: coded };

    const message = (body as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      // Only the guard's generic 401 means "session expired"; other 401s (e.g. an
      // invalid reset token) carry their own message.
      if (status === 401 && /unauthori[sz]ed/i.test(message)) {
        return { message: STATUS_MESSAGES_PT[401] };
      }
      const localized = localizeApiErrorMessage(message);
      const field = MESSAGE_FIELDS[message.trim()];
      return field
        ? { message: localized, fieldErrors: { [field]: localized } }
        : { message: localized };
    }
  }

  return { message: statusMessage ?? fallback };
}
