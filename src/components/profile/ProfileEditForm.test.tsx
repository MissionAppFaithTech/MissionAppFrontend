import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { mockProfile } from '@/mocks/profile';

vi.mock('@/services/username.service', () => ({
  checkUsernameAvailability: vi.fn().mockResolvedValue({
    available: false,
    username: 'nome_usado',
    suggestions: ['nome_usado1'],
  }),
}));

describe('ProfileEditForm Component', () => {
  it('renders all basic profile information and public contact fields', () => {
    render(<ProfileEditForm profile={mockProfile} />);

    expect(screen.getByRole('heading', { name: /editar perfil/i })).toBeInTheDocument();
    expect(screen.getByText(/informações básicas/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /informações de contato/i })).toBeInTheDocument();
    expect(
      screen.getByText(
        /essas informações serão exibidas publicamente para visitantes e apoiadores\./i
      )
    ).toBeInTheDocument();

    // Basic Fields
    expect(screen.getByDisplayValue(mockProfile.username)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProfile.displayName)).toBeInTheDocument();
    expect(screen.getByLabelText(/^bio:/i)).toHaveValue(mockProfile.roleDescription);
    expect(screen.queryByRole('button', { name: /desfazer alteração/i })).not.toBeInTheDocument();

    // Contact Fields
    expect(screen.getByLabelText(/^e-mail:$/i)).toHaveValue('samuelhe@gmail.com');
    expect(screen.getByLabelText(/^telefone:$/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /país do telefone/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /exibir e-mail no meu perfil/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /exibir telefone no meu perfil/i })).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /este número é um número de whatsapp/i })
    ).toBeChecked();

    // Action Buttons
    expect(screen.getByRole('link', { name: /voltar/i })).toHaveAttribute('href', '/profile/sobre');
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });

  it('allows form submission and triggers success toast notification', async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm profile={mockProfile} />);

    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(saveButton);

    expect(screen.getByText(/perfil atualizado com sucesso!/i)).toBeInTheDocument();
  });

  it('requires a valid email when the public email checkbox is checked', async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm profile={mockProfile} />);

    await user.clear(screen.getByLabelText(/^e-mail:$/i));
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByText(/informe um e-mail válido/i)).toBeInTheDocument();
    expect(screen.queryByText(/perfil atualizado com sucesso!/i)).not.toBeInTheDocument();
  });

  it('blocks save when the typed username is already taken', async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm profile={mockProfile} />);

    const username = screen.getByLabelText(/nome de usuário/i);
    await user.clear(username);
    await user.type(username, 'nome_usado');

    expect(await screen.findByText(/este nome de usuário já está em uso/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /salvar/i }));
    expect(screen.queryByText(/perfil atualizado com sucesso!/i)).not.toBeInTheDocument();
  });
});
