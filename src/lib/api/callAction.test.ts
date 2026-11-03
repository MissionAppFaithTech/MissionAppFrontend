import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, SESSION_EXPIRED_EVENT } from '@/lib/api/client';
import { callAction } from './callAction';

describe('callAction', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the data of a successful action', async () => {
    await expect(callAction(async () => ({ ok: true, data: { id: 1 } }))).resolves.toEqual({
      id: 1,
    });
  });

  it('throws an ApiError with the message, status, field errors and code', async () => {
    const error = await callAction(async () => ({
      ok: false,
      status: 422,
      message: 'Dados inválidos',
      fieldErrors: { name: 'Informe o nome' },
      code: 'E_VALIDATION_ERROR',
    })).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      message: 'Dados inválidos',
      status: 422,
      fieldErrors: { name: 'Informe o nome' },
      code: 'E_VALIDATION_ERROR',
    });
  });

  it('defaults to no field errors', async () => {
    await expect(
      callAction(async () => ({ ok: false, status: 500, message: 'Falhou' }))
    ).rejects.toMatchObject({ fieldErrors: {} });
  });

  it('announces an ended session before throwing', async () => {
    const onExpired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);

    await expect(
      callAction(async () => ({ ok: false, status: 401, message: 'Sua sessão expirou.' }))
    ).rejects.toMatchObject({ status: 401 });
    expect(onExpired).toHaveBeenCalledTimes(1);

    await expect(
      callAction(async () => ({ ok: false, status: 403, message: 'Proibido' }))
    ).rejects.toMatchObject({ status: 403 });
    expect(onExpired).toHaveBeenCalledTimes(1);
    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  });

  it('turns a failed request into a connection error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      callAction(async () => {
        throw new TypeError('Failed to fetch');
      })
    ).rejects.toMatchObject({
      status: 0,
      message: 'Não foi possível conectar. Verifique sua internet e tente novamente.',
    });
    expect(consoleError).toHaveBeenCalled();
  });
});
