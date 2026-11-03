import { describe, it, expect } from 'vitest';
import { formatWait, localizeFieldError, toBffError } from './errors';

describe('localizeFieldError', () => {
  it.each([
    ['email', 'Este e-mail já está em uso.'],
    ['username', 'Este nome de usuário já está em uso.'],
    ['phoneNumber', 'Este telefone já está em uso.'],
    ['website', 'Este valor já está em uso.'],
  ])('names the taken %s from the unique rule, not from English text', (field, expected) => {
    expect(
      localizeFieldError({
        field,
        rule: 'database.unique',
        message: 'The x has already been taken',
      })
    ).toBe(expected);
  });

  it.each([
    [{ rule: 'required' }, 'Campo obrigatório.'],
    [{ rule: 'maxLength', meta: { max: 255 } }, 'Use no máximo 255 caracteres.'],
    [{ rule: 'minLength', meta: { min: 3 } }, 'Use pelo menos 3 caracteres.'],
    [{ rule: 'email' }, 'Informe um e-mail válido.'],
    [{ rule: 'regex' }, 'Formato inválido.'],
    [{ rule: 'uuid' }, 'Identificador inválido.'],
    [{ rule: 'enum' }, 'Selecione uma opção válida.'],
    [{ rule: 'database.unique' }, 'Este valor já está em uso.'],
    [{ rule: 'unique' }, 'Este valor já está em uso.'],
  ])('localizes rule %o', (error, expected) => {
    expect(localizeFieldError({ field: 'x', message: 'english copy', ...error })).toBe(expected);
  });

  it('keeps the backend message for rules without copy here (custom rules send pt-BR)', () => {
    expect(localizeFieldError({ field: 'x', rule: 'custom', message: ' Mensagem própria ' })).toBe(
      'Mensagem própria'
    );
  });

  it('says the current password is wrong from its rule', () => {
    expect(
      localizeFieldError({
        field: 'currentPassword',
        rule: 'current_password',
        message: 'The current password is incorrect',
      })
    ).toBe('A senha atual está incorreta.');
  });

  it('uses a generic message when there is no rule match and no message', () => {
    expect(localizeFieldError({ field: 'x', rule: 'custom' })).toBe('Valor inválido.');
    expect(localizeFieldError({ field: 'x' })).toBe('Valor inválido.');
  });
});

describe('toBffError', () => {
  const FALLBACK = 'Falha genérica';

  it('maps Vine 422 errors to fieldErrors keeping the first message per field', () => {
    expect(
      toBffError(
        422,
        {
          errors: [
            { field: 'fullName', message: 'required', rule: 'required' },
            { field: 'username', message: 'max', rule: 'maxLength', meta: { max: 32 } },
            { field: 'username', message: 'regex', rule: 'regex' },
          ],
        },
        FALLBACK
      )
    ).toEqual({
      message: 'Revise os campos destacados e tente novamente.',
      fieldErrors: {
        fullName: 'Campo obrigatório.',
        username: 'Use no máximo 32 caracteres.',
      },
    });
  });

  it('uses the fallback as message when the status has no pt-BR mapping', () => {
    expect(
      toBffError(400, { errors: [{ field: 'zip', message: 'x', rule: 'required' }] }, FALLBACK)
    ).toEqual({ message: 'Campo obrigatório.', fieldErrors: { zip: 'Campo obrigatório.' } });
  });

  it('translates wrong credentials by code, not by the English message', () => {
    expect(
      toBffError(
        400,
        { message: 'Invalid user credentials', code: 'E_INVALID_CREDENTIALS' },
        FALLBACK
      )
    ).toEqual({
      message: 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
      code: 'E_INVALID_CREDENTIALS',
    });
  });

  it.each([
    ['E_BAD_REQUEST', 400],
    ['E_CONFLICT', 409],
    ['E_LOCKED', 423],
    ['E_METHOD_NOT_ALLOWED', 405],
    ['E_PAYLOAD_TOO_LARGE', 413],
    ['E_HTTP_ERROR', 418],
    ['E_REQUEST_ENTITY_TOO_LARGE', 413],
    ['E_ENCODING_UNSUPPORTED', 415],
    ['E_REQUEST_ABORTED', 400],
  ])('never shows the English message of the generic code %s', (code, status) => {
    const result = toBffError(status, { message: 'Some English text', code }, FALLBACK);
    expect(result.message).not.toBe('Some English text');
    expect(result.code).toBe(code);
  });

  it('puts business-rule errors on the field the backend names', () => {
    expect(
      toBffError(
        422,
        {
          message: 'Nome de usuário já está em uso',
          code: 'E_VALIDATION_ERROR',
          errors: [
            {
              field: 'username',
              rule: 'database.unique',
              message: 'Nome de usuário já está em uso',
            },
          ],
        },
        FALLBACK
      )
    ).toEqual({
      message: 'Este nome de usuário já está em uso.',
      fieldErrors: { username: 'Este nome de usuário já está em uso.' },
      code: 'E_VALIDATION_ERROR',
    });
    expect(
      toBffError(
        422,
        {
          message: 'Comunidade de fé informada não existe',
          code: 'E_VALIDATION_ERROR',
          errors: [
            {
              field: 'faithCommunityId',
              rule: 'database.exists',
              message: 'Comunidade de fé informada não existe',
            },
          ],
        },
        FALLBACK
      )
    ).toEqual({
      message: 'Comunidade de fé informada não existe',
      fieldErrors: { faithCommunityId: 'Comunidade de fé informada não existe' },
      code: 'E_VALIDATION_ERROR',
    });
  });

  it('never guesses a field from the message text', () => {
    expect(
      toBffError(
        422,
        { message: 'Nome de usuário já está em uso', code: 'E_VALIDATION_ERROR' },
        FALLBACK
      )
    ).toEqual({ message: 'Nome de usuário já está em uso', code: 'E_VALIDATION_ERROR' });
  });

  it('shows the wrong current password on its field', () => {
    expect(
      toBffError(
        422,
        {
          message: 'Validation Error',
          code: 'E_VALIDATION_ERROR',
          errors: [
            {
              field: 'currentPassword',
              rule: 'current_password',
              message: 'The current password is incorrect',
            },
          ],
        },
        FALLBACK
      )
    ).toEqual({
      message: 'A senha atual está incorreta.',
      fieldErrors: { currentPassword: 'A senha atual está incorreta.' },
      code: 'E_VALIDATION_ERROR',
    });
  });

  it('keeps the pt-BR message of a domain code as is', () => {
    expect(
      toBffError(
        404,
        { message: ' Perfil não encontrado ', code: 'E_MISSIONARY_PROFILE_NOT_FOUND' },
        FALLBACK
      )
    ).toEqual({ message: 'Perfil não encontrado', code: 'E_MISSIONARY_PROFILE_NOT_FOUND' });
  });

  it('never leaks the guard wording of a 401', () => {
    expect(
      toBffError(401, { message: 'Unauthorized access', code: 'E_UNAUTHORIZED_ACCESS' }, FALLBACK)
    ).toEqual({
      message: 'Sua sessão expirou. Entre novamente para continuar.',
      code: 'E_UNAUTHORIZED_ACCESS',
    });
  });

  it('keeps the own message of a non-session 401 (invalid reset token)', () => {
    expect(
      toBffError(401, { message: 'Token de redefinição inválido ou expirado' }, FALLBACK)
    ).toEqual({ message: 'Token de redefinição inválido ou expirado' });
  });

  it('names the taken field from the unique rule and promotes it to the message', () => {
    expect(
      toBffError(
        422,
        {
          errors: [
            {
              field: 'email',
              message: 'The email has already been taken',
              rule: 'database.unique',
            },
          ],
        },
        FALLBACK
      )
    ).toEqual({
      message: 'Este e-mail já está em uso.',
      fieldErrors: { email: 'Este e-mail já está em uso.' },
    });
  });

  it('keeps the generic message when several fields fail', () => {
    expect(
      toBffError(
        422,
        {
          errors: [
            { field: 'zip', message: 'x', rule: 'required' },
            { field: 'city', message: 'x', rule: 'required' },
          ],
        },
        FALLBACK
      ).message
    ).toBe('Revise os campos destacados e tente novamente.');
  });

  it('maps the plain-text 401 body to the session message', () => {
    expect(toBffError(401, 'Unauthorized access', FALLBACK)).toEqual({
      message: 'Sua sessão expirou. Entre novamente para continuar.',
    });
  });

  it.each([
    [403, 'Você não tem permissão para realizar esta ação.'],
    [404, 'Não encontramos o que você procurava.'],
    [409, 'Esta ação entra em conflito com dados já existentes.'],
    [422, 'Revise os campos destacados e tente novamente.'],
    [
      423,
      'Sua conta foi temporariamente bloqueada. Tente novamente mais tarde ou redefina sua senha.',
    ],
    [429, 'Muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente.'],
  ])('uses the pt-BR status message for status %i without a usable body', (status, message) => {
    expect(toBffError(status, undefined, FALLBACK)).toEqual({ message });
  });

  it('uses the fallback for unmapped statuses and unusable bodies', () => {
    expect(toBffError(500, '<html>oops</html>', FALLBACK)).toEqual({ message: FALLBACK });
    expect(toBffError(500, { message: '   ' }, FALLBACK)).toEqual({ message: FALLBACK });
    expect(toBffError(500, { errors: [] }, FALLBACK)).toEqual({ message: FALLBACK });
    expect(toBffError(500, null, FALLBACK)).toEqual({ message: FALLBACK });
  });

  it('falls through to `message` when `errors` has neither fields nor messages', () => {
    expect(toBffError(400, { errors: [{}], message: 'Algo deu errado' }, FALLBACK)).toEqual({
      message: 'Algo deu errado',
    });
  });
});

describe('toBffError edge cases', () => {
  const FALLBACK_MSG = 'Falhou';

  it('falls back to the trimmed `message` when `errors` is an empty array', () => {
    expect(
      toBffError(422, { errors: [], message: '  Nome de usuário já está em uso  ' }, FALLBACK_MSG)
    ).toEqual({ message: 'Nome de usuário já está em uso' });
  });

  it('keeps the first error per field and ignores field-less entries for fieldErrors', () => {
    expect(
      toBffError(
        422,
        {
          errors: [
            { field: 'zip', message: 'x', rule: 'required' },
            { field: 'zip', message: 'y', rule: 'maxLength', meta: { max: 20 } },
            { message: 'Invalid user credentials' },
          ],
        },
        FALLBACK_MSG
      )
    ).toEqual({ message: 'Campo obrigatório.', fieldErrors: { zip: 'Campo obrigatório.' } });
  });

  it('uses a field-less message when no entry names a field', () => {
    expect(
      toBffError(
        400,
        { errors: [{ message: 'x' }, { message: 'Invalid user credentials' }] },
        FALLBACK_MSG
      )
    ).toEqual({ message: 'x' });
  });
});

describe('toBffError status-specific session message', () => {
  it('explains a 403 by its code', () => {
    expect(toBffError(403, { message: 'Forbidden', code: 'E_FORBIDDEN' }, 'Falhou')).toEqual({
      message: 'Você não tem permissão para realizar esta ação.',
      code: 'E_FORBIDDEN',
    });
  });
});

describe('toBffError rate limit', () => {
  it('always uses the pt-BR rate limit message', () => {
    expect(toBffError(429, { message: 'Too many requests' }, 'Falhou')).toEqual({
      message: 'Muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente.',
    });
  });
});

describe('toBffError with the backend envelope (ADR-0034)', () => {
  it('maps English or generic messages by code and keeps the code', () => {
    expect(
      toBffError(401, { message: 'Unauthorized access', code: 'E_UNAUTHORIZED_ACCESS' }, 'x')
    ).toEqual({
      message: 'Sua sessão expirou. Entre novamente para continuar.',
      code: 'E_UNAUTHORIZED_ACCESS',
    });
    expect(
      toBffError(400, { message: 'Invalid user credentials', code: 'E_INVALID_CREDENTIALS' }, 'x')
        .message
    ).toBe('E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.');
    expect(
      toBffError(404, { message: 'Rota não encontrada.', code: 'E_ROUTE_NOT_FOUND' }, 'x').message
    ).toBe('Não encontramos o que você procurava.');
    expect(
      toBffError(500, { message: 'Erro interno', code: 'E_INTERNAL_SERVER_ERROR' }, 'x').message
    ).toBe('Ocorreu um erro inesperado. Tente novamente mais tarde.');
    expect(
      toBffError(503, { message: 'x', code: 'E_REFRESH_UNAVAILABLE' }, 'fallback').message
    ).toBe('Não foi possível renovar sua sessão agora. Tente novamente em instantes.');
  });

  it('keeps specific pt-BR domain messages for codes it does not map', () => {
    expect(
      toBffError(
        404,
        { message: 'Agência missionária não encontrada', code: 'E_MISSIONARY_AGENCY_NOT_FOUND' },
        'x'
      )
    ).toEqual({
      message: 'Agência missionária não encontrada',
      code: 'E_MISSIONARY_AGENCY_NOT_FOUND',
    });
  });

  it('tells how long to wait on a locked account (423)', () => {
    expect(
      toBffError(
        423,
        { message: 'Conta bloqueada', code: 'E_ACCOUNT_LOCKED', meta: { retryAfterSeconds: 300 } },
        'x'
      )
    ).toEqual({
      message:
        'Sua conta foi temporariamente bloqueada. Tente novamente em 5 minutos ou redefina sua senha.',
      code: 'E_ACCOUNT_LOCKED',
    });
  });

  it('tells how long to wait on a rate limit (429)', () => {
    expect(
      toBffError(
        429,
        { message: 'Muitas', code: 'E_TOO_MANY_REQUESTS', meta: { retryAfterSeconds: 60 } },
        'x'
      ).message
    ).toBe('Muitas tentativas em pouco tempo. Aguarde 1 minuto e tente novamente.');
    expect(toBffError(429, { message: 'Muitas', code: 'E_TOO_MANY_REQUESTS' }, 'x').message).toBe(
      'Muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente.'
    );
  });

  it('still maps field errors of a 422 envelope', () => {
    const result = toBffError(
      422,
      {
        message: 'Dados inválidos.',
        code: 'E_VALIDATION_ERROR',
        errors: [
          { field: 'email', rule: 'email', message: 'The email field must be a valid email' },
        ],
      },
      'x'
    );
    expect(result).toEqual({
      message: 'Informe um e-mail válido.',
      fieldErrors: { email: 'Informe um e-mail válido.' },
      code: 'E_VALIDATION_ERROR',
    });
  });

  it('ignores codes that do not follow the E_* contract', () => {
    expect(toBffError(400, { message: 'Bad', code: 'oops' }, 'x')).toEqual({ message: 'Bad' });
  });
});

describe('formatWait', () => {
  it('rounds up to minutes and says "alguns segundos" under a minute', () => {
    expect(formatWait(1)).toBe('alguns segundos');
    expect(formatWait(59)).toBe('alguns segundos');
    expect(formatWait(60)).toBe('1 minuto');
    expect(formatWait(61)).toBe('2 minutos');
    expect(formatWait(900)).toBe('15 minutos');
  });
});
