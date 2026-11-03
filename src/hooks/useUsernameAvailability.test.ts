import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isUsernameFormatValid,
  normalizeUsername,
  usernameAvailabilityHelper,
  useUsernameAvailability,
} from './useUsernameAvailability';
import { checkUsernameAvailability } from '@/services/username.service';
import { createQueryWrapper } from '@/test/query';

vi.mock('@/services/username.service', () => ({
  checkUsernameAvailability: vi.fn(),
}));

const mockedCheck = vi.mocked(checkUsernameAvailability);

describe('useUsernameAvailability helpers', () => {
  it('normalizes username to lowercase trimmed text', () => {
    expect(normalizeUsername(' _SamiMendonca ')).toBe('_samimendonca');
  });

  it('accepts only lowercase letters, numbers and underscore between 3 and 32 chars', () => {
    expect(isUsernameFormatValid('ab')).toBe(false);
    expect(isUsernameFormatValid('abc')).toBe(true);
    expect(isUsernameFormatValid('_sami')).toBe(true);
    expect(isUsernameFormatValid('Sami')).toBe(false);
  });

  it('prefers the schema error over the availability status message', () => {
    expect(usernameAvailabilityHelper('available', 'Nome de usuário inválido')).toBe(
      'Nome de usuário inválido'
    );
    expect(usernameAvailabilityHelper('taken')).toBe('Este nome de usuário já está em uso');
    expect(usernameAvailabilityHelper('available')).toBe('Nome de usuário disponível');
  });
});

describe('useUsernameAvailability', () => {
  beforeEach(() => {
    mockedCheck.mockReset();
    mockedCheck.mockResolvedValue({
      available: true,
      username: 'novo_user',
      suggestions: [],
    });
  });

  it('does not call the API when the username is still the current one', () => {
    const { result } = renderHook(
      () =>
        useUsernameAvailability({
          username: '_SamiMendonca',
          currentUsername: '_samimendonca',
        }),
      { wrapper: createQueryWrapper() }
    );

    expect(result.current.status).toBe('idle');
    expect(mockedCheck).not.toHaveBeenCalled();
  });

  it('marks a new username as taken after the backend check', async () => {
    const onTaken = vi.fn();
    mockedCheck.mockResolvedValue({
      available: false,
      username: 'allanna',
      suggestions: ['allanna1'],
    });

    const { result } = renderHook(
      () =>
        useUsernameAvailability({
          username: 'allanna',
          currentUsername: '_SamiMendonca',
          onTaken,
        }),
      { wrapper: createQueryWrapper() }
    );

    await waitFor(() => {
      expect(result.current.status).toBe('taken');
    });
    expect(result.current.suggestions).toEqual(['allanna1']);
    expect(onTaken).toHaveBeenCalled();
    expect(mockedCheck).toHaveBeenCalledWith('allanna');
  });

  it('waits for typing to stop, then reports an available username once', async () => {
    const onAvailable = vi.fn();
    const { result, rerender } = renderHook(
      ({ username }) => useUsernameAvailability({ username, onAvailable }),
      { wrapper: createQueryWrapper(), initialProps: { username: 'nov' } }
    );

    expect(result.current.status).toBe('checking');
    rerender({ username: 'novo_user' });

    await waitFor(() => expect(result.current.status).toBe('available'));
    expect(mockedCheck).toHaveBeenCalledTimes(1);
    expect(mockedCheck).toHaveBeenCalledWith('novo_user');
    expect(onAvailable).toHaveBeenCalledTimes(1);
    expect(result.current.suggestions).toEqual([]);
  });

  it('answers a username checked before from the cache', async () => {
    const { result, rerender } = renderHook(
      ({ username }) => useUsernameAvailability({ username }),
      { wrapper: createQueryWrapper(), initialProps: { username: 'novo_user' } }
    );
    await waitFor(() => expect(result.current.status).toBe('available'));

    rerender({ username: 'outro_user' });
    await waitFor(() => expect(mockedCheck).toHaveBeenCalledWith('outro_user'));
    rerender({ username: 'novo_user' });

    await waitFor(() => expect(result.current.status).toBe('available'));
    expect(mockedCheck).toHaveBeenCalledTimes(2);
  });

  it('reports an error when the check fails', async () => {
    mockedCheck.mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useUsernameAvailability({ username: 'novo_user' }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('stays idle and asks nothing for an invalid username', async () => {
    const { result } = renderHook(() => useUsernameAvailability({ username: 'No' }), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.status).toBe('idle');
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(mockedCheck).not.toHaveBeenCalled();
  });
});
