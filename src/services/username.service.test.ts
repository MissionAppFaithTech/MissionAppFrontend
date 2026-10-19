import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkUsernameAvailability } from './username.service';

describe('username.service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns availability for a unique username', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { available: true, username: 'user_novo', suggestions: [] },
        }),
      })
    );

    const result = await checkUsernameAvailability('user_novo');
    expect(result).toEqual({ available: true, username: 'user_novo', suggestions: [] });
  });

  it('accepts an unwrapped backend payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ available: true, username: 'livre', suggestions: [] }),
      })
    );

    const result = await checkUsernameAvailability('livre');
    expect(result.available).toBe(true);
  });

  it('provides suggestions when username is taken', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            available: false,
            username: 'pedro',
            suggestions: ['pedro1', 'pedro_1', 'pedro2'],
          },
        }),
      })
    );

    const result = await checkUsernameAvailability('pedro');
    expect(result.available).toBe(false);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('throws when the BFF returns an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Nome de usuário inválido' }),
      })
    );

    await expect(checkUsernameAvailability('ab')).rejects.toThrow('Nome de usuário inválido');
  });
});
