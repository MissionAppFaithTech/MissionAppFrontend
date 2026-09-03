import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home page (Landing Page route /)', () => {
  it('renders landing hero headline and CTA buttons', () => {
    render(<Home />);

    // Check hero heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/conectando/i)).toBeInTheDocument();

    // Check Start Now CTA
    expect(screen.getByRole('link', { name: /comece agora/i })).toHaveAttribute(
      'href',
      '/select-role'
    );

    // Check Learn More CTA
    expect(screen.getByRole('link', { name: /saiba mais/i })).toHaveAttribute(
      'href',
      '#como-funciona'
    );
  });
});
