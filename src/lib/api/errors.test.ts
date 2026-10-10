import { describe, it, expect } from 'vitest';
import { extractErrorMessage, localizeApiErrorMessage } from './errors';

describe('localizeApiErrorMessage', () => {
  it('translates Vine unique e-mail and username messages to Portuguese', () => {
    expect(localizeApiErrorMessage('The email has already been taken')).toBe(
      'Este e-mail já está em uso'
    );
    expect(localizeApiErrorMessage('The username has already been taken')).toBe(
      'Este nome de usuário já está em uso'
    );
  });

  it('leaves Portuguese messages unchanged', () => {
    expect(localizeApiErrorMessage('Este e-mail já está em uso')).toBe('Este e-mail já está em uso');
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
