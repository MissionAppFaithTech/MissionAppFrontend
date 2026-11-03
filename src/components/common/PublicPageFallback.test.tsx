import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PublicPageFallback from './PublicPageFallback';

describe('PublicPageFallback', () => {
  it('keeps the main landmark and announces the loading state', () => {
    render(<PublicPageFallback label="Carregando perfil" />);

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('tabindex', '-1');

    const status = screen.getByRole('status', { name: 'Carregando perfil' });
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });
});
