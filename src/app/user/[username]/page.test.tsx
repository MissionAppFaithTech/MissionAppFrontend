import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserPage, { generateMetadata } from './page';

vi.mock('./UserProfileContent', () => ({
  UserProfileBody: () => <div data-testid="user-profile-body" />,
}));

describe('UserPage public visitor route (/user/[username])', () => {
  it('generates proper OpenGraph and page metadata', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ username: '_SamiMendonca' }),
    });

    expect(meta.title).toContain('_SamiMendonca');
    expect(meta.alternates?.canonical).toBe('/user/_SamiMendonca');
  });

  it('renders the visitor navbar around the streamed profile body', () => {
    render(UserPage({ params: Promise.resolve({ username: '_SamiMendonca' }) }));

    expect(screen.getByTestId('user-profile-body')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^entrar$/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: /cadastre-se/i })).toBeInTheDocument();
  });
});
