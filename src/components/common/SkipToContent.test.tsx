import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SkipToContent from './SkipToContent';
import { DEFAULT_A11Y_PREFERENCES, useA11yPreferencesStore } from '@/stores/a11yPreferencesStore';

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

  it('jumps without smooth scrolling when the in-app "Reduzir movimento" is on', () => {
    useA11yPreferencesStore.setState({ reduceMotion: true });
    const main = document.createElement('main');
    main.id = 'main-content';
    main.tabIndex = -1;
    main.scrollIntoView = vi.fn();
    document.body.appendChild(main);
    render(<SkipToContent />);

    screen.getByRole('link', { name: /pular para o conteúdo principal/i }).click();

    expect(main.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
    expect(main).toHaveFocus();
    main.remove();
    useA11yPreferencesStore.setState({ ...DEFAULT_A11Y_PREFERENCES });
  });
});
