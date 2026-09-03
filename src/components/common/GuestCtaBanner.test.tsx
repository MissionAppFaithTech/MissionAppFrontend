import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GuestCtaBanner from './GuestCtaBanner';

describe('GuestCtaBanner component', () => {
  it('renders default title and description', () => {
    render(<GuestCtaBanner />);
    expect(screen.getByText(/crie sua conta para acompanhar/i)).toBeInTheDocument();
    expect(screen.getByText(/com uma conta você segue missionários/i)).toBeInTheDocument();
    const ctaButton = screen.getByRole('link', { name: /criar conta/i });
    expect(ctaButton).toHaveAttribute('href', '/select-role');
  });

  it('renders custom props when provided', () => {
    render(
      <GuestCtaBanner
        title="Título Customizado"
        description="Descrição Customizada"
        buttonText="Cadastrar Agora"
        buttonHref="/register/supporters"
      />
    );
    expect(screen.getByText('Título Customizado')).toBeInTheDocument();
    expect(screen.getByText('Descrição Customizada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cadastrar Agora' })).toHaveAttribute(
      'href',
      '/register/supporters'
    );
  });
});
