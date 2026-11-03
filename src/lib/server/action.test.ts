import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { clearRefreshCache } from '@/lib/api/bff';
import { AUTH_COOKIE } from '@/lib/auth/cookies';
import {
  NEW_TOKENS,
  authCookiesCleared,
  backendError,
  backendMock,
  cookieValue,
  mockBackend,
  onlyNewToken,
  resetActionHarness,
  setSession,
} from '@/test/actionHarness';
import { actionFailure, parseInput, runWithSession } from './action';

vi.mock('next/headers', async () => (await import('@/test/actionHarness')).headersMock);
vi.mock('@/lib/api/backend', async () => (await import('@/test/actionHarness')).backendMock);

const SESSION_EXPIRED = 'Sua sessão expirou. Entre novamente para continuar.';

beforeEach(() => {
  clearRefreshCache();
  resetActionHarness();
});

describe('parseInput', () => {
  const schema = z.object({ name: z.string().min(1, 'Informe o nome'), age: z.number() });

  it('returns the parsed data', () => {
    expect(parseInput(schema, { name: 'Ana', age: 3 }, 'Inválido')).toEqual({
      ok: true,
      data: { name: 'Ana', age: 3 },
    });
  });

  it('answers 422 with the first message of each field', () => {
    const result = parseInput(schema, { name: '' }, 'Dados inválidos');

    expect(result).toMatchObject({ ok: false, status: 422, message: 'Dados inválidos' });
    expect(result.ok === false && result.fieldErrors).toMatchObject({ name: 'Informe o nome' });
    expect(result.ok === false && Object.keys(result.fieldErrors ?? {})).toEqual(['name', 'age']);
  });

  it('rejects input that is not an object', () => {
    expect(parseInput(schema, 'texto', 'Dados inválidos')).toMatchObject({
      ok: false,
      status: 422,
      fieldErrors: {},
    });
  });
});

describe('actionFailure', () => {
  it('maps a backend error to its status and pt-BR copy', () => {
    const failure = actionFailure(
      backendError(429, {
        message: 'Too many requests',
        code: 'E_TOO_MANY_REQUESTS',
        meta: { retryAfterSeconds: 60 },
      }),
      'Falhou',
      'test'
    );

    expect(failure).toMatchObject({ ok: false, status: 429, code: 'E_TOO_MANY_REQUESTS' });
    expect(failure.message).not.toBe('Too many requests');
  });

  it('logs other errors and answers 502 with the fallback', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const boom = new TypeError('fetch failed');

    expect(actionFailure(boom, 'Não foi possível salvar', 'actions/test')).toEqual({
      ok: false,
      status: 502,
      message: 'Não foi possível salvar',
    });
    expect(consoleError).toHaveBeenCalledWith('[actions/test]', boom);
    consoleError.mockRestore();
  });
});

describe('runWithSession', () => {
  it('runs the handler with the access token and leaves the cookies alone', async () => {
    const handler = vi.fn(async (token: string) => `ok:${token.length > 0}`);

    await expect(runWithSession('t', 'Falhou', handler)).resolves.toEqual({
      ok: true,
      data: 'ok:true',
    });
    expect(handler).toHaveBeenCalledWith(cookieValue(AUTH_COOKIE.accessToken));
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });

  it('refreshes after a backend 401, retries and stores the new tokens', async () => {
    mockBackend({
      'POST /auth/refresh': () => ({ data: NEW_TOKENS }),
      'GET /thing': onlyNewToken({ value: 1 }),
    });

    const result = await runWithSession('t', 'Falhou', (accessToken) =>
      backendMock.backendFetch('/thing', { accessToken })
    );

    expect(result).toEqual({ ok: true, data: { value: 1 } });
    expect(cookieValue(AUTH_COOKIE.accessToken)).toBe(NEW_TOKENS.accessToken);
    expect(cookieValue(AUTH_COOKIE.refreshToken)).toBe(NEW_TOKENS.refreshToken);
  });

  it('answers 401 and clears the cookies when the refresh fails', async () => {
    mockBackend({
      'POST /auth/refresh': () => {
        throw backendError(401, { message: 'Invalid refresh token' });
      },
      'GET /thing': onlyNewToken({}),
    });

    const result = await runWithSession('t', 'Falhou', (accessToken) =>
      backendMock.backendFetch('/thing', { accessToken })
    );

    expect(result).toEqual({ ok: false, status: 401, message: SESSION_EXPIRED });
    expect(authCookiesCleared()).toBe(true);
  });

  it('answers 401 without calling the backend when there is no session', async () => {
    setSession();
    const handler = vi.fn();

    await expect(runWithSession('t', 'Falhou', handler)).resolves.toMatchObject({
      ok: false,
      status: 401,
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('maps other failures and keeps the session', async () => {
    const result = await runWithSession('t', 'Não foi possível salvar', async () => {
      throw backendError(422, {
        message: 'Validation failure',
        code: 'E_VALIDATION_ERROR',
        errors: [{ field: 'name', rule: 'required', message: 'The name field must be defined' }],
      });
    });

    expect(result).toMatchObject({ ok: false, status: 422 });
    expect(result.ok === false && result.fieldErrors).toHaveProperty('name');
    expect(cookieValue(AUTH_COOKIE.accessToken)).toBeDefined();
  });
});
