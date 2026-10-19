import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import UsernameAvailabilityField from './UsernameAvailabilityField';
import { checkUsernameAvailability } from '@/services/username.service';

vi.mock('@/services/username.service', () => ({
  checkUsernameAvailability: vi.fn(),
}));

const mockedCheck = vi.mocked(checkUsernameAvailability);

describe('UsernameAvailabilityField', () => {
  beforeEach(() => {
    mockedCheck.mockReset();
    mockedCheck.mockResolvedValue({
      available: true,
      username: 'novo_user',
      suggestions: [],
    });
  });

  it('does not check availability while the username is still the current one', () => {
    render(
      <UsernameAvailabilityField
        value="_samimendonca"
        onChange={vi.fn()}
        currentUsername="_SamiMendonca"
      />
    );

    expect(screen.getByLabelText(/nome de usuário/i)).toHaveValue('_samimendonca');
    expect(mockedCheck).not.toHaveBeenCalled();
    expect(screen.queryByLabelText(/verificando disponibilidade/i)).not.toBeInTheDocument();
  });

  it('shows a green mark when a new username is available', async () => {
    render(
      <UsernameAvailabilityField
        value="novo_user"
        onChange={vi.fn()}
        currentUsername="_SamiMendonca"
      />
    );

    expect(await screen.findByText(/nome de usuário disponível/i)).toBeInTheDocument();
    expect(document.querySelector('[data-testid="CheckIcon"]')).toBeTruthy();
    expect(mockedCheck).toHaveBeenCalledWith('novo_user');
  });

  it('shows taken state and suggestions when the username is already in use', async () => {
    const handleChange = vi.fn();
    mockedCheck.mockResolvedValue({
      available: false,
      username: 'allanna',
      suggestions: ['allanna1'],
    });

    render(
      <UsernameAvailabilityField
        value="allanna"
        onChange={handleChange}
        currentUsername="_SamiMendonca"
      />
    );

    expect(await screen.findByText(/este nome de usuário já está em uso/i)).toBeInTheDocument();
    expect(document.querySelector('[data-testid="CloseIcon"]')).toBeTruthy();

    const suggestion = screen.getByRole('button', { name: /usar nome de usuário allanna1/i });
    expect(suggestion).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(suggestion);
    expect(handleChange).toHaveBeenCalledWith('allanna1');
  });
});
