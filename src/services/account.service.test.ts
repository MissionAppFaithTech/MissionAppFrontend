import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerAccount, toApiGender, toE164Phone } from './account.service';

describe('account.service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps UI gender to API gender', () => {
    expect(toApiGender('feminino')).toBe('FEMALE');
    expect(toApiGender('masculino')).toBe('MALE');
  });

  it('normalizes phone to E.164', () => {
    expect(toE164Phone('+55 11 99999-8888')).toBe('+5511999998888');
    expect(toE164Phone('5511999998888')).toBe('+5511999998888');
  });

  it('registers an account through the BFF', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { user: { id: '1', fullName: 'Ana', email: 'ana@example.com' } },
        }),
      })
    );

    const result = await registerAccount({
      fullName: 'Ana',
      username: 'ana',
      phoneNumber: '+5511999998888',
      gender: 'FEMALE',
      email: 'ana@example.com',
      password: 'Senha@123',
      passwordConfirmation: 'Senha@123',
    });

    expect(result.user.email).toBe('ana@example.com');
  });

  it('translates a taken e-mail error to Portuguese', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'The email has already been taken' }),
      })
    );

    await expect(
      registerAccount({
        fullName: 'Ana',
        username: 'ana',
        phoneNumber: '+5511999998888',
        gender: 'FEMALE',
        email: 'ana@example.com',
        password: 'Senha@123',
        passwordConfirmation: 'Senha@123',
      })
    ).rejects.toThrow('Este e-mail já está em uso');
  });
});
