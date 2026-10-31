import { describe, it, expect } from 'vitest';
import {
  extractErrorMessage,
  localizeApiErrorMessage,
  localizeFieldError,
  toBffError,
} from './errors';

describe('localizeApiErrorMessage', () => {
  it('translates Vine unique e-mail and username messages to Portuguese', () => {
    expect(localizeApiErrorMessage('The email has already been taken')).toBe(
      'Este e-mail já está em uso'
    );
    expect(localizeApiErrorMessage('The username has already been taken')).toBe(
      'Este nome de usuário já está em uso'
    );
    expect(localizeApiErrorMessage('Invalid user credentials')).toBe(
      'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.'
    );
    expect(localizeApiErrorMessage('E_INVALID_CREDENTIALS')).toBe(
      'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.'
    );
  });

  it('leaves Portuguese messages unchanged', () => {
    expect(localizeApiErrorMessage('Este e-mail já está em uso')).toBe(
      'Este e-mail já está em uso'
    );
  });
});

describe('extractErrorMessage', () => {
  it('reads the first Vine error and localizes it', () => {
    expect(
      extractErrorMessage(
        { errors: [{ message: 'The email has already been taken', field: 'email' }] },
        'Não foi possível concluir o cadastro'
      )
    ).toBe('Este e-mail já está em uso');
  });
});

describe('localizeFieldError', () => {
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

  it('falls back to the localized backend message for unknown rules', () => {
    expect(
      localizeFieldError({
        field: 'email',
        rule: 'custom',
        message: 'The email has already been taken',
      })
    ).toBe('Este e-mail já está em uso');
    expect(localizeFieldError({ field: 'x', rule: 'custom', message: 'Mensagem própria' })).toBe(
      'Mensagem própria'
    );
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

  it('maps the auth 400 `{ errors: [{ message }] }` shape to a localized message', () => {
    expect(
      toBffError(400, { errors: [{ message: 'Invalid user credentials' }] }, FALLBACK)
    ).toEqual({
      message: 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
    });
  });

  it('maps `{ message }` bodies tied to a field into fieldErrors', () => {
    expect(toBffError(422, { message: 'Nome de usuário já está em uso' }, FALLBACK)).toEqual({
      message: 'Nome de usuário já está em uso',
      fieldErrors: { username: 'Nome de usuário já está em uso' },
    });
    expect(toBffError(422, { message: 'Comunidade de fé informada não existe' }, FALLBACK)).toEqual(
      {
        message: 'Comunidade de fé informada não existe',
        fieldErrors: { faithCommunityId: 'Comunidade de fé informada não existe' },
      }
    );
  });

  it('localizes generic `{ message }` bodies without fieldErrors', () => {
    expect(toBffError(400, { message: 'The current password is incorrect' }, FALLBACK)).toEqual({
      message: 'A senha atual está incorreta.',
    });
    expect(toBffError(404, { message: 'Perfil não encontrado' }, FALLBACK)).toEqual({
      message: 'Perfil não encontrado',
    });
  });

  it('never leaks backend wording for 401 `{ message }` bodies', () => {
    expect(toBffError(401, { message: 'E_UNAUTHORIZED_ACCESS: token' }, FALLBACK)).toEqual({
      message: 'Sua sessão expirou. Entre novamente para continuar.',
    });
  });

  it('keeps the own message of a non-session 401 (invalid reset token)', () => {
    expect(
      toBffError(401, { message: 'Token de redefinição inválido ou expirado' }, FALLBACK)
    ).toEqual({ message: 'Token de redefinição inválido ou expirado' });
  });

  it('uses the known translation for a unique-field error and promotes it to the message', () => {
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
      message: 'Este e-mail já está em uso',
      fieldErrors: { email: 'Este e-mail já está em uso' },
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

  it('falls back to `message` when `errors` is an empty array', () => {
    expect(
      toBffError(422, { errors: [], message: 'Nome de usuário já está em uso' }, FALLBACK_MSG)
    ).toEqual({
      message: 'Nome de usuário já está em uso',
      fieldErrors: { username: 'Nome de usuário já está em uso' },
    });
  });

  it('matches field-bound messages even with surrounding spaces', () => {
    expect(
      toBffError(422, { message: '  Nome de usuário já está em uso  ' }, FALLBACK_MSG).fieldErrors
    ).toEqual({ username: 'Nome de usuário já está em uso' });
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
  it('maps "Unauthorized" wording to the session message only for 401', () => {
    expect(toBffError(403, { message: 'Unauthorized' }, 'Falhou')).toEqual({
      message: 'Acesso não autorizado. Por favor, realize o login novamente.',
    });
  });
});
