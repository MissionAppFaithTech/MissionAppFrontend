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
    expect(document.querySelector('a[href="/select-role"]')).toBeTruthy();
    expect(screen.getByRole('button', { name: /abrir menu/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /preferências de acessibilidade/i })
    ).not.toBeInTheDocument();

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

  it('marks the current section with one underline and the same font weight as the other links', () => {
    render(<SiteHeader />);

    const current = screen.getAllByRole('link', { name: 'Início' })[0];
    const other = screen.getAllByRole('link', { name: 'Como funciona' })[0];
    const cssFor = (element: Element) => {
      const emotionClass = [...element.classList].find((name) => name.startsWith('css-'));
      return [...document.querySelectorAll('style')]
        .map((style) => style.textContent ?? '')
        .find((css) => emotionClass && css.includes(`.${emotionClass}`));
    };

    expect(getComputedStyle(current).fontWeight).toBe(getComputedStyle(other).fontWeight);
    expect(cssFor(current)).toContain('text-decoration:underline');
    expect(cssFor(current)).not.toContain('::after');
    expect(cssFor(other)).toContain('text-decoration:none');
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
