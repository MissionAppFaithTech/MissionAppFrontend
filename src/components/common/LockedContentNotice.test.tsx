import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LockedContentNotice from './LockedContentNotice';

describe('LockedContentNotice component', () => {
  it('renders default locked message and action buttons', () => {
    render(<LockedContentNotice />);
    expect(screen.getByText(/entre para ver o perfil completo/i)).toBeInTheDocument();
    expect(
      screen.getByText(/pedidos de oração, contato e campanhas ficam visíveis para membros/i)
    ).toBeInTheDocument();

    const loginLink = screen.getByRole('link', { name: /fazer login/i });
    expect(loginLink).toHaveAttribute('href', '/login');

    const registerLink = screen.getByRole('link', { name: /cadastrar/i });
    expect(registerLink).toHaveAttribute('href', '/select-role');
  });

  it('renders custom title, description and links', () => {
    render(
      <LockedContentNotice
        title="Conteúdo Restrito"
        description="Apenas para mantenedores autorizados."
        loginHref="/login-custom"
        registerHref="/register-custom"
      />
    );
    expect(screen.getByText('Conteúdo Restrito')).toBeInTheDocument();
    expect(screen.getByText('Apenas para mantenedores autorizados.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /fazer login/i })).toHaveAttribute(
      'href',
      '/login-custom'
    );
    expect(screen.getByRole('link', { name: /cadastrar/i })).toHaveAttribute(
      'href',
      '/register-custom'
    );
  });
});
