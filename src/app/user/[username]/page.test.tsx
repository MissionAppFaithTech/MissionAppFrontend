import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { getPublicProfile } from '@/lib/server/publicProfile';
import { publicProfileFixture } from '@/test/publicProfile';
import UserPage, { generateMetadata } from './page';

vi.mock('@/lib/server/publicProfile', () => ({ getPublicProfile: vi.fn() }));

vi.mock('./UserProfileContent', () => ({
  UserProfileBody: () => <div data-testid="user-profile-body" />,
}));

describe('UserPage public visitor route (/user/[username])', () => {
  it('builds the metadata from the backend profile, with a lowercase canonical', async () => {
    vi.mocked(getPublicProfile).mockResolvedValue(publicProfileFixture);

    const meta = await generateMetadata({
      params: Promise.resolve({ username: 'Samuel_Missionary' }),
    });

    expect(meta.title).toBe('Samuel Mendonça (@samuel_missionary)');
    expect(meta.description).toContain('Sirvo comunidades rurais');
    expect(meta.alternates?.canonical).toBe('/user/samuel_missionary');
    expect((meta.openGraph as Record<string, unknown>)?.type).toBe('profile');
  });

  it('keeps a missing profile out of search engines', async () => {
    vi.mocked(getPublicProfile).mockResolvedValue(null);

    const meta = await generateMetadata({ params: Promise.resolve({ username: 'pendente' }) });

    expect(meta.title).toBe('Perfil não encontrado');
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it('renders the visitor navbar around the streamed profile body', () => {
    render(UserPage({ params: Promise.resolve({ username: '_SamiMendonca' }) }));

    expect(screen.getByTestId('user-profile-body')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^entrar$/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: /cadastre-se/i })).toBeInTheDocument();
  });
});
