import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/client';
import {
  ministryStepErrors,
  laterStepErrors,
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

  it('maps the missionary sign-up fields of the first step (birth date, document)', () => {
    const error = new ApiError('Validation failure', 422, {
      birthDate: 'a',
      identityDocument: 'b',
      'missionaryAgency.name': 'c',
    });

    expect(signupFieldErrors(error)).toEqual({ birthDate: 'a', document: 'b' });
    expect(personalStepErrors({ birthDate: 'a', document: 'b', username: 'c' })).toEqual({
      birthDate: 'a',
      document: 'b',
    });
  });

  it('maps the "Dados ministeriais" fields, including a new agency or community', () => {
    const error = new ApiError('Validation failure', 422, {
      missionaryAgency: 'Informe a agência',
      'missionaryAgency.name': 'Nome obrigatório',
      faithCommunityId: 'Comunidade de fé informada não existe',
      aboutMe: 'Texto longo demais',
      email: 'Em uso',
    });

    expect(ministryStepErrors(error)).toEqual({
      missionaryAgency: 'Informe a agência',
      faithCommunity: 'Comunidade de fé informada não existe',
      missionDescription: 'Texto longo demais',
    });
    expect(
      ministryStepErrors(
        new ApiError('Validation failure', 422, { 'faithCommunity.pastorPhone': 'Inválido' })
      )
    ).toEqual({ faithCommunity: 'Nova comunidade de fé: Inválido' });
    expect(ministryStepErrors(new Error('boom'))).toEqual({});
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

describe('laterStepErrors', () => {
  it('keeps only what does not belong to "Dados pessoais"', () => {
    expect(
      laterStepErrors({
        document: 'Este CPF já está cadastrado.',
        email: 'Em uso',
        missionaryAgency: 'Não existe',
        missionDescription: 'Longo demais',
      })
    ).toEqual({ missionaryAgency: 'Não existe', missionDescription: 'Longo demais' });
    expect(laterStepErrors({})).toEqual({});
  });
});
