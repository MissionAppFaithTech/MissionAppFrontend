import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AccessCredentialsStep from './AccessCredentialsStep';

vi.mock('@/services/username.service', () => ({
  checkUsernameAvailability: vi.fn().mockResolvedValue({ available: true }),
}));

describe('AccessCredentialsStep component', () => {
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
});
