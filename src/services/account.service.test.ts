import { describe, expect, it, vi } from 'vitest';
import { registerAccountAction } from '@/app/actions/account';
import { ApiError } from '@/lib/api/client';
import { registerAccount, toApiGender, toE164Phone } from './account.service';

vi.mock('@/app/actions/account', () => ({ registerAccountAction: vi.fn() }));

describe('account.service', () => {
  it('maps UI gender to API gender', () => {
    expect(toApiGender('feminino')).toBe('FEMALE');
    expect(toApiGender('masculino')).toBe('MALE');
  });

  it('normalizes phone to E.164', () => {
    expect(toE164Phone('+55 11 99999-8888')).toBe('+5511999998888');
    expect(toE164Phone('5511999998888')).toBe('+5511999998888');
  });

  it('registers an account through the Server Action', async () => {
    vi.mocked(registerAccountAction).mockResolvedValue({
      ok: true,
      data: { user: { id: '1', fullName: 'Ana', email: 'ana@example.com' } as never },
    });

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

  it('passes on the pt-BR message and field errors the action built from the backend code', async () => {
    vi.mocked(registerAccountAction).mockResolvedValue({
      ok: false,
      status: 422,
      message: 'Este e-mail já está em uso',
      fieldErrors: { email: 'Este e-mail já está em uso' },
      code: 'E_VALIDATION_ERROR',
    });

    const failure = registerAccount({
      fullName: 'Ana',
      username: 'ana',
      phoneNumber: '+5511999998888',
      gender: 'FEMALE',
      email: 'ana@example.com',
      password: 'Senha@123',
      passwordConfirmation: 'Senha@123',
    });
    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({
      fieldErrors: { email: 'Este e-mail já está em uso' },
    });

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
