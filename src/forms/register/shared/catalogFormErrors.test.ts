import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { applyCatalogFieldErrors } from './catalogFormErrors';

function apiError(fieldErrors: Record<string, string>) {
  return new ApiError('Revise os campos destacados e tente novamente.', 422, fieldErrors);
}

describe('applyCatalogFieldErrors', () => {
  it('puts each API error on its modal field and focuses the first one', () => {
    const setError = vi.fn();

    const alert = applyCatalogFieldErrors(
      apiError({
        name: 'Já existe uma comunidade com este nome nesta cidade.',
        postalCode: 'CEP inválido.',
        addressLine1: 'Use no máximo 255 caracteres.',
        pastorPhone: 'Telefone inválido.',
      }),
      setError,
      'churchPhone'
    );

    expect(alert).toBeNull();
    expect(setError.mock.calls).toEqual([
      [
        'name',
        { type: 'server', message: 'Já existe uma comunidade com este nome nesta cidade.' },
        { shouldFocus: true },
      ],
      ['zipCode', { type: 'server', message: 'CEP inválido.' }, { shouldFocus: false }],
      [
        'address1',
        { type: 'server', message: 'Use no máximo 255 caracteres.' },
        { shouldFocus: false },
      ],
      ['pastorPhone', { type: 'server', message: 'Telefone inválido.' }, { shouldFocus: false }],
    ]);
  });

  it.each([
    ['phone', 'phone'],
    ['churchPhone', 'churchPhone'],
  ] as const)('sends the API phoneNumber to the %s field', (phoneField, expected) => {
    const setError = vi.fn();

    applyCatalogFieldErrors(apiError({ phoneNumber: 'Telefone inválido.' }), setError, phoneField);

    expect(setError).toHaveBeenCalledWith(
      expected,
      { type: 'server', message: 'Telefone inválido.' },
      { shouldFocus: true }
    );
  });

  it('answers the message for the alert when no error fits a field', () => {
    const setError = vi.fn();

    expect(applyCatalogFieldErrors(apiError({ somethingElse: 'x' }), setError, 'phone')).toBe(
      'Revise os campos destacados e tente novamente.'
    );
    expect(setError).not.toHaveBeenCalled();
    expect(applyCatalogFieldErrors(new Error('Sem conexão.'), setError, 'phone')).toBe(
      'Sem conexão.'
    );
    expect(applyCatalogFieldErrors('boom', setError, 'phone')).toBe(
      'Não foi possível salvar o cadastro.'
    );
  });

  it.each([
    ['name', 'name'],
    ['addressLine1', 'address1'],
    ['addressLine2', 'address2'],
    ['city', 'city'],
    ['state', 'state'],
    ['country', 'country'],
    ['postalCode', 'zipCode'],
    ['website', 'website'],
    ['pastorName', 'pastorName'],
    ['pastorPhone', 'pastorPhone'],
  ])('maps the API field %s to the modal field %s', (apiField, field) => {
    const setError = vi.fn();

    expect(
      applyCatalogFieldErrors(apiError({ [apiField]: 'Inválido.' }), setError, 'phone')
    ).toBeNull();
    expect(setError).toHaveBeenCalledWith(
      field,
      { type: 'server', message: 'Inválido.' },
      { shouldFocus: true }
    );
  });
});
