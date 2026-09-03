import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResetPasswordPage from './page';

describe('ResetPasswordPage route (/reset-password)', () => {
  it('renders new password heading and form fields', () => {
    render(<ResetPasswordPage />);

    expect(screen.getByRole('heading', { name: /nova senha/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voltar para o login/i })).toHaveAttribute(
      'href',
      '/login'
    );
  });
});
