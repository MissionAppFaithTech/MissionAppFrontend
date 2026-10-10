import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import AccessCredentialsStep from './AccessCredentialsStep';
import { checkUsernameAvailability } from '@/services/username.service';

vi.mock('@/services/username.service', () => ({
  checkUsernameAvailability: vi.fn().mockResolvedValue({
    available: true,
    username: 'usuario_teste',
    suggestions: [],
  }),
}));

const mockedCheck = vi.mocked(checkUsernameAvailability);

describe('AccessCredentialsStep component', () => {
  beforeEach(() => {
    mockedCheck.mockReset();
    mockedCheck.mockResolvedValue({
      available: true,
      username: 'usuario_teste',
      suggestions: [],
    });
  });

  it('renders access credentials inputs and always-enabled submit button', () => {
    const handleSubmit = vi.fn();
    const handleBack = vi.fn();

    render(
      <AccessCredentialsStep
        onSubmit={handleSubmit}
        onBack={handleBack}
        submitLabel="Finalizar cadastro"
      />
    );

    expect(screen.getByText('Dados de acesso')).toBeInTheDocument();
    expect(screen.getByLabelText(/nome de usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /requisitos da senha/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/uma letra maiúscula: faltando/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/caractere especial/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /finalizar cadastro/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).not.toBeDisabled();
  });

  it('displays validation errors when submitting empty credentials', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    const handleBack = vi.fn();

    render(
      <AccessCredentialsStep
        onSubmit={handleSubmit}
        onBack={handleBack}
        submitLabel="Finalizar cadastro"
      />
    );

    const submitBtn = screen.getByRole('button', { name: /finalizar cadastro/i });
    await user.click(submitBtn);

    expect(await screen.findByText(/informe seu nome de usuário/i)).toBeInTheDocument();
    expect(await screen.findByText(/informe sua senha/i)).toBeInTheDocument();
    expect(await screen.findByText(/confirme sua senha/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits valid credentials and triggers onSubmit', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    const handleBack = vi.fn();

    render(
      <AccessCredentialsStep
        onSubmit={handleSubmit}
        onBack={handleBack}
        submitLabel="Finalizar cadastro"
      />
    );

    await user.type(screen.getByLabelText(/nome de usuário/i), 'usuario_teste');
    await user.type(screen.getByLabelText(/^senha/i), 'SenhaForte@123');
    await user.type(screen.getByLabelText(/confirmar senha/i), 'SenhaForte@123');

    const submitBtn = screen.getByRole('button', { name: /finalizar cadastro/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'usuario_teste',
          password: 'SenhaForte@123',
          confirmPassword: 'SenhaForte@123',
        })
      );
    });
  });

  it('calls onBack when clicking Voltar', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    const handleBack = vi.fn();

    render(
      <AccessCredentialsStep
        onSubmit={handleSubmit}
        onBack={handleBack}
        submitLabel="Finalizar cadastro"
      />
    );

    await user.click(screen.getByRole('button', { name: /voltar/i }));
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('shows a green available mark after the backend accepts the username', async () => {
    const user = userEvent.setup();
    mockedCheck.mockResolvedValue({
      available: true,
      username: 'allanna_c',
      suggestions: [],
    });

    render(<AccessCredentialsStep onSubmit={vi.fn()} onBack={vi.fn()} />);
    await user.type(screen.getByLabelText(/nome de usuário/i), 'allanna_c');

    expect(await screen.findByText(/nome de usuário disponível/i)).toBeInTheDocument();
    expect(document.querySelector('[data-testid="CheckIcon"]')).toBeTruthy();
    expect(mockedCheck).toHaveBeenCalledWith('allanna_c');
  });

  it('shows a red unavailable mark when the backend says the username is taken', async () => {
    const user = userEvent.setup();
    mockedCheck.mockResolvedValue({
      available: false,
      username: 'allanna',
      suggestions: ['allanna1'],
    });

    render(<AccessCredentialsStep onSubmit={vi.fn()} onBack={vi.fn()} />);
    await user.type(screen.getByLabelText(/nome de usuário/i), 'allanna');

    expect(await screen.findByText(/este nome de usuário já está em uso/i)).toBeInTheDocument();
    expect(document.querySelector('[data-testid="CloseIcon"]')).toBeTruthy();
    expect(screen.getByRole('button', { name: /usar nome de usuário allanna1/i })).toBeInTheDocument();
  });

  it('warns while the confirmation password differs', async () => {
    const user = userEvent.setup();

    render(<AccessCredentialsStep onSubmit={vi.fn()} onBack={vi.fn()} />);
    await user.type(screen.getByLabelText(/^senha/i), 'SenhaForte@123');
    await user.type(screen.getByLabelText(/confirmar senha/i), 'SenhaDiferente@1');

    expect(await screen.findByText(/as senhas precisam ser iguais/i)).toBeInTheDocument();
  });
});
