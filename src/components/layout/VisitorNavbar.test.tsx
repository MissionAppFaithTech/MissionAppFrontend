import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VisitorNavbar from './VisitorNavbar';

describe('VisitorNavbar component', () => {
  it('renders logo, search field and guest action buttons', () => {
    render(<VisitorNavbar />);

    // Logo presence
    expect(screen.getByAltText(/mission app/i)).toBeInTheDocument();

    // Search field
    expect(screen.getByPlaceholderText(/pesquisar missionário/i)).toBeInTheDocument();

    // Entrar and Cadastre-se buttons
    const loginBtn = screen.getByRole('link', { name: /^entrar$/i });
    expect(loginBtn).toHaveAttribute('href', '/login');

    const registerBtn = screen.getByRole('link', { name: /cadastre-se/i });
    expect(registerBtn).toHaveAttribute('href', '/select-role');
  });
});
