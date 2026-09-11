import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VisitorNavbar from './VisitorNavbar';
import AppTopNavbar from './AppTopNavbar';

describe('VisitorNavbar and AppTopNavbar component', () => {
  it('renders logo and guest action buttons when isLoggedIn is false (non-registered view)', () => {
    render(<VisitorNavbar isLoggedIn={false} />);

    // Logo presence
    expect(screen.getByAltText(/mission app/i)).toBeInTheDocument();

    // Search field is NOT present for non-registered view
    expect(screen.queryByPlaceholderText(/buscar/i)).not.toBeInTheDocument();

    // Theme toggle presence
    expect(screen.getByRole('button', { name: /alternar tema|modo/i })).toBeInTheDocument();

    // Entrar and Cadastre-se buttons
    const loginBtn = screen.getByRole('link', { name: /^entrar$/i });
    expect(loginBtn).toHaveAttribute('href', '/login');

    const registerBtn = screen.getByRole('link', { name: /cadastre-se/i });
    expect(registerBtn).toHaveAttribute('href', '/select-role');

    // Profile account menu is NOT present
    expect(screen.queryByRole('button', { name: /abrir menu do perfil/i })).not.toBeInTheDocument();
  });

  it('renders search field and profile account menu when isLoggedIn is true (logged-in view)', () => {
    render(<AppTopNavbar isLoggedIn={true} role="missionary" />);

    // Logo presence
    expect(screen.getByAltText(/mission app/i)).toBeInTheDocument();

    // Search field is present for logged in user
    expect(
      screen.getByPlaceholderText(/buscar missionários, projetos ou campanhas/i)
    ).toBeInTheDocument();

    // Profile account menu / avatar is present
    expect(screen.getByRole('button', { name: /abrir menu do perfil/i })).toBeInTheDocument();

    // Login and Register buttons are NOT present
    expect(screen.queryByRole('link', { name: /^entrar$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /cadastre-se/i })).not.toBeInTheDocument();
  });
});
