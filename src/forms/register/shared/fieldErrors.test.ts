import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/client';
import {
  personalStepErrors,
  REGISTER_FIELD_LABELS,
  signupFieldErrors,
  toFormErrors,
} from './fieldErrors';

describe('registration field errors', () => {
  it('maps the API signup fields to the form fields', () => {
    const error = new ApiError('Validation failure', 422, {
      fullName: 'a',
      email: 'b',
      phoneNumber: 'c',
      gender: 'd',
      username: 'e',
      password: 'f',
      passwordConfirmation: 'g',
      unknownField: 'h',
    });

    expect(signupFieldErrors(error)).toEqual({
      fullName: 'a',
      email: 'b',
      phone: 'c',
      gender: 'd',
      username: 'e',
      password: 'f',
      confirmPassword: 'g',
    });
  });

  it('has nothing to map for errors that are not from the API', () => {
    expect(signupFieldErrors(new Error('Rede'))).toEqual({});
    expect(signupFieldErrors('boom')).toEqual({});
  });

  it('keeps only the fields of the "Dados pessoais" step', () => {
    expect(personalStepErrors({ email: 'b', phone: 'c', username: 'e', password: 'f' })).toEqual({
      email: 'b',
      phone: 'c',
    });
  });

  it('builds react-hook-form server errors', () => {
    expect(toFormErrors({ email: 'Em uso' })).toEqual({
      email: { type: 'server', message: 'Em uso' },
    });
  });

  it('has a visible label for every field', () => {
    expect(REGISTER_FIELD_LABELS.phone).toBe('Telefone');
    expect(REGISTER_FIELD_LABELS.confirmPassword).toBe('Confirmar senha');
  });
});
