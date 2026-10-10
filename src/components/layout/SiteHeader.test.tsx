import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SiteHeader from './SiteHeader';

describe('SiteHeader', () => {
  it('renders landing navigation and auth actions without a theme toggle', () => {
    render(<SiteHeader />);

    expect(screen.getByRole('navigation', { name: /navegação principal/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^entrar$/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /cadastre-se/i })).toHaveAttribute(
      'href',
      '/select-role'
    );
    expect(screen.getByRole('button', { name: /abrir menu/i })).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /alternar tema|ativar modo escuro|ativar modo claro/i })
    ).not.toBeInTheDocument();
  });
});
