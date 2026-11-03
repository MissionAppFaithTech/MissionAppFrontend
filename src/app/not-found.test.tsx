import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { authenticatedSession, renderWithSession } from '@/test/session';
import NotFound, { metadata } from './not-found';

describe('NotFound', () => {
  it('tells the visitor the page is missing and links home', async () => {
    await renderWithSession(<NotFound />, authenticatedSession('SUPPORTER'));

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir para o início' })).toHaveAttribute('href', '/');
  });

  it('keeps 404 pages out of search engines', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
