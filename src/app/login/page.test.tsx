import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoginPage from './page';

describe('LoginPage route (/login)', () => {
  it('renders login form inputs, submit button, and navigation links', () => {
    render(<LoginPage />);

    // Inputs (Email and Password)
    expect(screen.getByLabelText(/^e-mail$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();

    // Submit button
    expect(screen.getByRole('button', { name: /^entrar$/i })).toBeInTheDocument();

    // Links: Forgot password & register
    expect(screen.getByRole('link', { name: /esqueceu sua senha/i })).toHaveAttribute(
      'href',
      '/forgot-password'
    );
    expect(screen.getByRole('link', { name: /registre-se/i })).toHaveAttribute(
      'href',
      '/select-role'
    );
  });
});
