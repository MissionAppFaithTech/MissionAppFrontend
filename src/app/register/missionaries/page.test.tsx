import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RegisterMissionariesPage from './page';

describe('RegisterMissionariesPage route (/register/missionaries)', () => {
  it('renders missionaries registration wizard', () => {
    render(<RegisterMissionariesPage />);

    expect(screen.getByRole('heading', { name: /cadastro/i })).toBeInTheDocument();
    expect(screen.getAllByText(/dados pessoais/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
  });
});
