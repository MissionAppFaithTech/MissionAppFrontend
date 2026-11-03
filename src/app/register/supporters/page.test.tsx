import { screen } from '@testing-library/react';
import { renderWithQuery } from '@/test/query';
import { describe, it, expect } from 'vitest';
import RegisterSupportersPage from './page';

describe('RegisterSupportersPage route (/register/supporters)', () => {
  it('renders supporters registration wizard step 1', () => {
    renderWithQuery(<RegisterSupportersPage />);

    expect(screen.getByRole('heading', { name: /cadastro/i })).toBeInTheDocument();
    expect(screen.getAllByText(/dados pessoais/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
  });
});
