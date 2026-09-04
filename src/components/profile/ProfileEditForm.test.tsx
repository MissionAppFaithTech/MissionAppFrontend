import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { mockProfile } from '@/mocks/profile';

describe('ProfileEditForm Component', () => {
  it('renders all basic profile information and public contact fields', () => {
    render(<ProfileEditForm profile={mockProfile} />);

    expect(screen.getByRole('heading', { name: /editar perfil/i })).toBeInTheDocument();
    expect(screen.getByText(/informações básicas/i)).toBeInTheDocument();
    expect(screen.getByText(/contatos públicos/i)).toBeInTheDocument();

    // Basic Fields
    expect(screen.getByDisplayValue(mockProfile.username)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProfile.displayName)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProfile.roleDescription)).toBeInTheDocument();

    // Contact Fields
    expect(screen.getByLabelText(/e-mail de contato público/i)).toHaveValue('samuelhe@gmail.com');
    expect(screen.getByLabelText(/telefone de contato público/i)).toHaveValue(
      '+55 (21) 98765-4321'
    );
    expect(screen.getByLabelText(/número do whatsapp/i)).toHaveValue('+5521987654321');

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
});
