import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ForgotPasswordPage from './page';

describe('ForgotPasswordPage route (/forgot-password)', () => {
  it('renders recovery email form and login back-link', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByRole('heading', { name: /esqueci minha senha/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar link/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voltar para o login/i })).toHaveAttribute(
      'href',
      '/login'
    );
  });
});
