import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { ApiError, SESSION_EXPIRED_EVENT, bffRequest } from './client';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('ApiError', () => {
  it('carries status, message, name and defaults fieldErrors to an empty object', () => {
    const error = new ApiError('Falhou', 422);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('Falhou');
    expect(error.status).toBe(422);
    expect(error.fieldErrors).toEqual({});
  });
});

describe('bffRequest', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends a GET without body or Content-Type and returns the parsed payload', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({ data: { ok: true } }));

    const result = await bffRequest<{ data: { ok: boolean } }>('/api/thing', {
      fallbackMessage: 'fallback',
    });

    expect(result).toEqual({ data: { ok: true } });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [path, init] = fetchSpy.mock.calls[0];
    expect(path).toBe('/api/thing');
    expect(init).toEqual({
      method: 'GET',
      headers: { Accept: 'application/json' },
      body: undefined,
      cache: 'no-store',
      credentials: 'same-origin',
    });
  });

  it('serializes the body as JSON and sets Content-Type when a body is given', async () => {
    fetchSpy.mockResolvedValue(jsonResponse({ data: {} }));

    await bffRequest('/api/thing', {
      method: 'PATCH',
      body: { name: 'Ana', bio: null },
      fallbackMessage: 'fallback',
    });

    const [, init] = fetchSpy.mock.calls[0];
    expect(init?.method).toBe('PATCH');
    expect(init?.headers).toEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    expect(init?.body).toBe(JSON.stringify({ name: 'Ana', bio: null }));
  });

  it('returns null when a successful response has no JSON body', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(bffRequest('/api/thing', { fallbackMessage: 'fallback' })).resolves.toBeNull();
  });

  it('throws ApiError with the BFF message, status and field errors on failure', async () => {
    fetchSpy.mockResolvedValue(
      jsonResponse(
        { message: 'Dados inválidos', fieldErrors: { username: 'Nome de usuário em uso' } },
        422
      )
    );

    const error = await bffRequest('/api/thing', {
      method: 'POST',
      body: {},
      fallbackMessage: 'fallback',
    }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      message: 'Dados inválidos',
      status: 422,
      fieldErrors: { username: 'Nome de usuário em uso' },
    });
  });

  it.each([
    ['an empty message', jsonResponse({ message: '' }, 500)],
    ['a non-string message', jsonResponse({ message: 42 }, 500)],
    ['a body that is not JSON', new Response('<html>boom</html>', { status: 502 })],
  ])('falls back to fallbackMessage when the error has %s', async (_label, response) => {
    fetchSpy.mockResolvedValue(response);

    const error = await bffRequest('/api/thing', { fallbackMessage: 'Algo deu errado' }).catch(
      (e: unknown) => e
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).message).toBe('Algo deu errado');
    expect((error as ApiError).status).toBe(response.status);
    expect((error as ApiError).fieldErrors).toEqual({});
  });

  it('dispatches the session-expired event on 401 and still throws', async () => {
    const listener = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, listener);
    fetchSpy.mockResolvedValue(jsonResponse({ message: 'Sessão expirada' }, 401));

    try {
      await expect(bffRequest('/api/thing', { fallbackMessage: 'fallback' })).rejects.toMatchObject(
        { status: 401, message: 'Sessão expirada' }
      );
      expect(listener).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
    }
  });

  it.each([403, 404, 500])('does not dispatch the session-expired event on %i', async (status) => {
    const listener = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, listener);
    fetchSpy.mockResolvedValue(jsonResponse({ message: 'erro' }, status));

    try {
      await expect(bffRequest('/api/thing', { fallbackMessage: 'fallback' })).rejects.toMatchObject(
        { status }
      );
      expect(listener).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
    }
  });

  it('maps a network failure to ApiError with status 0 and a connectivity message', async () => {
    const listener = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, listener);
    fetchSpy.mockRejectedValue(new TypeError('Failed to fetch'));

    try {
      const error = await bffRequest('/api/thing', { fallbackMessage: 'fallback' }).catch(
        (e: unknown) => e
      );

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(0);
      expect((error as ApiError).message).toBe(
        'Não foi possível conectar. Verifique sua internet e tente novamente.'
      );
      expect(listener).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
    }
  });
});
