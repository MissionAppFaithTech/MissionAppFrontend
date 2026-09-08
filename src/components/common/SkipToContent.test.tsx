import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SkipToContent from './SkipToContent';

describe('SkipToContent component', () => {
  it('renders skip link with default label and href', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link', { name: /pular para o conteúdo principal/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('renders with custom label and custom contentId', () => {
    render(<SkipToContent contentId="conteudo-alvo" label="Ir ao conteúdo" />);
    const link = screen.getByRole('link', { name: /ir ao conteúdo/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#conteudo-alvo');
  });

  it('scrolls and focuses target element on click', () => {
    const target = document.createElement('main');
    target.id = 'main-content';
    target.tabIndex = -1;
    target.scrollIntoView = vi.fn();
    target.focus = vi.fn();
    document.body.appendChild(target);

    render(<SkipToContent />);
    const link = screen.getByRole('link', { name: /pular para o conteúdo principal/i });
    link.click();

    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(target.focus).toHaveBeenCalledWith({ preventScroll: true });

    document.body.removeChild(target);
  });
});
