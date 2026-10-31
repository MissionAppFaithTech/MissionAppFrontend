import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { clearRefreshCache } from '@/lib/api/bff';

vi.mock('@/lib/api/backend', () => ({
  backendFetch: vi.fn(),
  BackendApiError: class BackendApiError extends Error {
    constructor(
      message: string,
      public status: number,
      public body?: unknown
    ) {
      super(message);
      this.name = 'BackendApiError';
    }
  },
}));

const post = (body: unknown) =>
  POST(
    new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  );

const valid = {
  token: 'reset-token-123',
  password: 'Password123!',
  passwordConfirmation: 'Password123!',
};

beforeEach(() => {
  clearRefreshCache();
  vi.mocked(backendFetch).mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/auth/reset-password', () => {
  it('calls the backend PATCH with newPassword/newPasswordConfirmation', async () => {
    vi.mocked(backendFetch).mockResolvedValue({ message: 'Senha redefinida.' });

    const res = await post(valid);

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ message: 'Senha redefinida.' });
    expect(backendFetch).toHaveBeenCalledExactlyOnceWith('/auth/reset-password', {
      method: 'PATCH',
      body: {
        token: 'reset-token-123',
        newPassword: 'Password123!',
        newPasswordConfirmation: 'Password123!',
      },
    });
    expect(vi.mocked(backendFetch).mock.calls[0][1]).not.toHaveProperty('accessToken');
  });

  it.each([
    ['an empty text body', ''],
    ['a body without message', {}],
  ])('uses the default success message for %s', async (_label, result) => {
    vi.mocked(backendFetch).mockResolvedValue(result);

    const res = await post(valid);

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ message: 'Senha redefinida com sucesso.' });
  });

  it('does not set any cookie', async () => {
    vi.mocked(backendFetch).mockResolvedValue({ message: 'ok' });

    const res = await post(valid);

    expect(res.headers.getSetCookie()).toEqual([]);
  });

  it('answers 400 for invalid JSON', async () => {
    const res = await post('invalid-json');

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: 'JSON inválido' });
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('answers 422 on the confirmation field when the passwords do not match', async () => {
    const res = await post({ ...valid, passwordConfirmation: 'DifferentPassword456!' });

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      message: 'Dados inválidos para redefinição de senha',
      fieldErrors: { passwordConfirmation: 'As senhas não coincidem' },
    });
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it.each([
    ['short', 'Ab1!', 'A senha deve ter pelo menos 8 caracteres'],
    ['long', 'A'.repeat(33), 'A senha deve ter no máximo 32 caracteres'],
  ])('answers 422 for a too %s password', async (_label, password, message) => {
    const res = await post({ ...valid, password, passwordConfirmation: password });

    expect(res.status).toBe(422);
    expect((await res.json()).fieldErrors).toEqual({ password: message });
  });

  it('answers 422 when the token is missing', async () => {
    const res = await post({ password: valid.password, passwordConfirmation: valid.password });

    expect(res.status).toBe(422);
    expect((await res.json()).fieldErrors).toHaveProperty('token');
  });

  it('maps a backend `{ message }` error (e.g. expired token)', async () => {
    vi.mocked(backendFetch).mockRejectedValue(
      new BackendApiError('Token inválido ou expirado', 400, {
        message: 'Token inválido ou expirado',
      })
    );

    const res = await post(valid);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: 'Token inválido ou expirado' });
  });

  it('maps backend Vine 422 errors onto the reset form fields', async () => {
    vi.mocked(backendFetch).mockRejectedValue(
      new BackendApiError('Validation failure', 422, {
        errors: [{ field: 'newPassword', message: 'regex', rule: 'regex' }],
      })
    );

    const res = await post(valid);

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      message: 'Formato inválido.',
      fieldErrors: { password: 'Formato inválido.' },
    });
  });

  it('maps a 404 to the pt-BR not-found message', async () => {
    vi.mocked(backendFetch).mockRejectedValue(new BackendApiError('Not found', 404, undefined));

    const res = await post(valid);

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({
      message: 'Não encontramos o que você procurava.',
    });
  });

  it('answers 502 with the fallback message when the backend is unreachable', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const boom = new TypeError('fetch failed');
    vi.mocked(backendFetch).mockRejectedValue(boom);

    const res = await post(valid);

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ message: 'Não foi possível redefinir a senha' });
    expect(consoleError).toHaveBeenCalledWith('[api/auth/reset-password]', boom);
  });
});
