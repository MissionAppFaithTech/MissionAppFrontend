/** Field labels for "Este … já está em uso" (VineJS `database.unique`). */
const TAKEN_FIELD_LABELS: Record<string, string> = {
  email: 'e-mail',
  username: 'nome de usuário',
  phoneNumber: 'telefone',
  phone_number: 'telefone',
};

/**
 * Fields whose `database.unique` message the backend already writes in pt-BR and
 * more precisely than a label could ("Este CPF já está cadastrado." /
 * "Este passaporte já está cadastrado.": the same field holds both documents).
 */
const TAKEN_MESSAGE_FROM_API = new Set(['identityDocument']);

export type BffErrorBody = {
  message: string;
  /** Field name (backend camelCase) → pt-BR message, for react-hook-form `setError`. */
  fieldErrors?: Record<string, string>;
  /** Stable backend error code (`E_*`, backend ADR-0034), when the API sent one. */
  code?: string;
};

/**
 * pt-BR copy for backend codes whose `message` is English or too generic. Domain
 * codes not listed here already arrive with a specific pt-BR message, so errors
 * are translated by `code` only, never by English text (backend ADR-0034).
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
  // Codes the envelope derives from a bare status: their `message` may be English.
  E_BAD_REQUEST: 'Não foi possível processar o pedido. Revise os dados e tente novamente.',
  E_CONFLICT: 'Esta ação entra em conflito com dados já existentes.',
  E_LOCKED: 'Este recurso está bloqueado no momento. Tente novamente mais tarde.',
  E_METHOD_NOT_ALLOWED: 'Não foi possível concluir esta ação. Tente novamente.',
  E_PAYLOAD_TOO_LARGE: 'Os dados enviados são grandes demais. Envie um arquivo menor.',
  // The body parser sets these itself (413, 415, 400), with English messages.
  E_REQUEST_ENTITY_TOO_LARGE: 'Os dados enviados são grandes demais. Envie um arquivo menor.',
  E_ENCODING_UNSUPPORTED: 'Não foi possível processar o pedido. Revise os dados e tente novamente.',
  E_REQUEST_ABORTED: 'O envio foi interrompido. Verifique sua conexão e tente novamente.',
  E_HTTP_ERROR: 'Não foi possível concluir esta ação. Tente novamente.',
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
    case 'current_password':
      return 'A senha atual está incorreta.';
    case 'database.unique':
    case 'unique': {
      if (
        typeof error.field === 'string' &&
        TAKEN_MESSAGE_FROM_API.has(error.field) &&
        typeof error.message === 'string' &&
        error.message.trim()
      ) {
        return error.message.trim();
      }
      const label = typeof error.field === 'string' ? TAKEN_FIELD_LABELS[error.field] : undefined;
      return label ? `Este ${label} já está em uso.` : 'Este valor já está em uso.';
    }
    default:
      // Rules without copy here keep the backend message (custom rules send pt-BR).
      return typeof error.message === 'string' && error.message.trim()
        ? error.message.trim()
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
        if (typeof raw.field === 'string') {
          if (!fieldErrors[raw.field]) fieldErrors[raw.field] = localizeFieldError(raw);
        } else if (!firstMessage && typeof raw.message === 'string') {
          firstMessage = raw.message.trim();
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
      return { message: message.trim() };
    }
  }

  return { message: statusMessage ?? fallback };
}
