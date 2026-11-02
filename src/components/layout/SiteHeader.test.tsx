import { act, render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SiteHeader from './SiteHeader';

function setScrollTop(value: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value });
}

describe('SiteHeader', () => {
  it('renders landing navigation and auth actions without a theme toggle', () => {
    render(<SiteHeader />);

    expect(screen.getByRole('navigation', { name: /navegação principal/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^entrar$/i })[0]).toHaveAttribute('href', '/login');
    expect(screen.getAllByRole('link', { name: /cadastre-se/i })[0]).toHaveAttribute(
      'href',
      '/select-role'
    );
    expect(screen.getByRole('button', { name: /abrir menu/i })).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /alternar tema|ativar modo escuro|ativar modo claro/i })
    ).not.toBeInTheDocument();
  });

  it('paints a solid bar after the page scrolls and clears it at the top', () => {
    setScrollTop(0);
    render(<SiteHeader />);

    const header = screen.getByRole('banner');
    expect(header.getAttribute('style')).toContain('background-color: transparent');

    act(() => {
      setScrollTop(48);
      document.dispatchEvent(new Event('scroll'));
    });

    expect(header.getAttribute('style')).toContain(
      'background-color: var(--app-navbar-scrim, #ffffff)'
    );

    act(() => {
      setScrollTop(0);
      document.dispatchEvent(new Event('scroll'));
    });

    expect(header.getAttribute('style')).toContain('background-color: transparent');
  });

  it('renders login CTA buttons for both desktop and mobile views with accessible links', () => {
    render(<SiteHeader />);

    const loginLinks = screen.getAllByRole('link', { name: /^entrar$/i });
    expect(loginLinks.length).toBeGreaterThanOrEqual(1);
    loginLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/login');
    });
  });
});
