import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VisitorNavbar from './VisitorNavbar';

describe('VisitorNavbar component', () => {
  it('renders logo and guest action buttons without search field', () => {
    render(<VisitorNavbar />);

    // Logo presence
    expect(screen.getByAltText(/mission app/i)).toBeInTheDocument();

    // Search field is NOT present (gain space, search is in bottom nav)
    expect(screen.queryByPlaceholderText(/pesquisar/i)).not.toBeInTheDocument();

    // Theme toggle presence
    expect(screen.getByRole('button', { name: /alternar tema|modo/i })).toBeInTheDocument();

    // Entrar and Cadastre-se buttons
    const loginBtn = screen.getByRole('link', { name: /^entrar$/i });
    expect(loginBtn).toHaveAttribute('href', '/login');

    const registerBtn = screen.getByRole('link', { name: /cadastre-se/i });
    expect(registerBtn).toHaveAttribute('href', '/select-role');
  });
});
