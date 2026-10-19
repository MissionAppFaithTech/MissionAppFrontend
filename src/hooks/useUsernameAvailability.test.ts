import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isUsernameFormatValid,
  normalizeUsername,
  usernameAvailabilityHelper,
  useUsernameAvailability,
} from './useUsernameAvailability';
import { checkUsernameAvailability } from '@/services/username.service';

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
    const { result } = renderHook(() =>
      useUsernameAvailability({
        username: '_SamiMendonca',
        currentUsername: '_samimendonca',
      })
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

    const { result } = renderHook(() =>
      useUsernameAvailability({
        username: 'allanna',
        currentUsername: '_SamiMendonca',
        onTaken,
      })
    );

    await waitFor(() => {
      expect(result.current.status).toBe('taken');
    });
    expect(result.current.suggestions).toEqual(['allanna1']);
    expect(onTaken).toHaveBeenCalled();
    expect(mockedCheck).toHaveBeenCalledWith('allanna');
  });
});
