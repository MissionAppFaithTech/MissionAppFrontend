import { screen, waitFor } from '@testing-library/react';
import { renderWithQuery } from '@/test/query';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import AccessCredentialsStep from './AccessCredentialsStep';
import { ApiError } from '@/lib/api/client';
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

    renderWithQuery(
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

  it('keeps the required asterisk inside the password label, like the other fields', () => {
    renderWithQuery(
      <AccessCredentialsStep onSubmit={vi.fn()} onBack={vi.fn()} submitLabel="Finalizar cadastro" />
    );

    // A block label pushed MUI's asterisk out of the label, over the typed text.
    const label = screen.getByText('Senha', { selector: 'label' });
    expect(label.querySelector('.MuiFormLabel-asterisk')).not.toBeNull();
    expect(label.querySelector('div')).toBeNull();
    expect(screen.getByLabelText(/^senha/i)).toBeRequired();
  });

  it('lists the empty credentials in a focused summary', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    renderWithQuery(
      <AccessCredentialsStep
        onSubmit={handleSubmit}
        onBack={vi.fn()}
        submitLabel="Finalizar cadastro"
        progress={{ step: 3, total: 3 }}
      />
    );

    await user.click(screen.getByRole('button', { name: /finalizar cadastro/i }));

    const summary = await screen.findByRole('alert');
    expect(summary).toHaveFocus();
    expect(summary).toHaveTextContent('Corrija 3 campos para continuar');
    expect(summary).toHaveTextContent('Nome de usuário: Informe seu nome de usuário');
    expect(summary).toHaveTextContent('Senha: Informe sua senha');
    expect(summary).toHaveTextContent('Confirmar senha: Confirme sua senha');
    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Etapa 3 de 3: Dados de acesso'
    );
  });

  it('submits valid credentials and triggers onSubmit', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    const handleBack = vi.fn();

    renderWithQuery(
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

    renderWithQuery(
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

    renderWithQuery(<AccessCredentialsStep onSubmit={vi.fn()} onBack={vi.fn()} />);
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

    renderWithQuery(<AccessCredentialsStep onSubmit={vi.fn()} onBack={vi.fn()} />);
    await user.type(screen.getByLabelText(/nome de usuário/i), 'allanna');

    expect(await screen.findByText(/este nome de usuário já está em uso/i)).toBeInTheDocument();
    expect(document.querySelector('[data-testid="CloseIcon"]')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /usar nome de usuário allanna1/i })
    ).toBeInTheDocument();
  });

  it('checks that the passwords match when the user leaves the confirmation', async () => {
    const user = userEvent.setup();

    renderWithQuery(<AccessCredentialsStep onSubmit={vi.fn()} onBack={vi.fn()} />);
    await user.type(screen.getByLabelText(/^senha/i), 'SenhaForte@123');
    await user.type(screen.getByLabelText(/confirmar senha/i), 'SenhaDiferente@1');
    expect(screen.queryByText(/as senhas precisam ser iguais/i)).not.toBeInTheDocument();

    await user.tab();
    expect(await screen.findByText(/as senhas precisam ser iguais/i)).toBeInTheDocument();
  });

  it('rejects a password longer than the API accepts (32)', async () => {
    const user = userEvent.setup();

    renderWithQuery(<AccessCredentialsStep onSubmit={vi.fn()} onBack={vi.fn()} />);
    await user.type(screen.getByLabelText(/^senha/i), `Aa1@${'x'.repeat(29)}`);
    await user.tab();

    expect(await screen.findByText(/use no máximo 32 caracteres/i)).toBeInTheDocument();
  });

  it('shows the API rejection of a credential on its field', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi
      .fn()
      .mockRejectedValue(
        new ApiError('Validation failure', 422, { username: 'Este nome de usuário já está em uso' })
      );

    renderWithQuery(<AccessCredentialsStep onSubmit={handleSubmit} onBack={vi.fn()} />);
    await user.type(screen.getByLabelText(/nome de usuário/i), 'ana_souza');
    await user.type(screen.getByLabelText(/^senha/i), 'SenhaForte@123');
    await user.type(screen.getByLabelText(/confirmar senha/i), 'SenhaForte@123');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    const summary = await screen.findByRole('alert');
    await waitFor(() => expect(summary).toHaveFocus());
    expect(summary).toHaveTextContent('Nome de usuário: Este nome de usuário já está em uso');
    expect(screen.getByRole('textbox', { name: /nome de usuário/i })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('keeps the generic message for errors that are not about a field', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockRejectedValue(new Error('Servidor indisponível'));

    renderWithQuery(<AccessCredentialsStep onSubmit={handleSubmit} onBack={vi.fn()} />);
    await user.type(screen.getByLabelText(/nome de usuário/i), 'ana_souza');
    await user.type(screen.getByLabelText(/^senha/i), 'SenhaForte@123');
    await user.type(screen.getByLabelText(/confirmar senha/i), 'SenhaForte@123');
    await user.click(screen.getByRole('button', { name: /continuar/i }));

    expect(await screen.findByText('Servidor indisponível')).toBeInTheDocument();
  });

  it('offers the browser password manager and show-password toggles', () => {
    renderWithQuery(<AccessCredentialsStep onSubmit={vi.fn()} onBack={vi.fn()} />);

    expect(screen.getByLabelText(/^senha/i)).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByLabelText(/confirmar senha/i)).toHaveAttribute(
      'autocomplete',
      'new-password'
    );
    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });
});
