import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UserPage, { generateMetadata } from './page';

describe('UserPage public visitor route (/user/[username])', () => {
  it('generates proper OpenGraph and page metadata', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ username: '_SamiMendonca' }),
    });

    expect(meta.title).toContain('_SamiMendonca');
    expect(meta.alternates?.canonical).toBe('/user/_SamiMendonca');
  });

  it('renders public visitor profile layout with visitor navbar, profile view, and bottom nav', async () => {
    const PageComponent = await UserPage({
      params: Promise.resolve({ username: '_SamiMendonca' }),
    });

    render(PageComponent);

    // Visitor Navbar present
    expect(screen.getAllByRole('link', { name: /^entrar$/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: /cadastre-se/i })).toBeInTheDocument();

    // Guest CTA Banner present
    expect(screen.getByText(/crie sua conta para acompanhar/i)).toBeInTheDocument();

    // Locked content notice present
    expect(screen.getByText(/entre para ver o perfil completo/i)).toBeInTheDocument();
  });
});
