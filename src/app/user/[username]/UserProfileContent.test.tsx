import { render, screen } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { notFound } from 'next/navigation';
import { getPublicProfile } from '@/lib/server/publicProfile';
import { publicProfileFixture } from '@/test/publicProfile';
import { UserProfileBody, UserProfileContent } from './UserProfileContent';

vi.mock('@/lib/server/publicProfile', () => ({ getPublicProfile: vi.fn() }));
vi.mock('next/navigation', async () => ({
  ...(await vi.importActual('next/navigation')),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('UserProfileContent', () => {
  beforeEach(() => {
    vi.mocked(getPublicProfile).mockReset();
  });

  it('renders the backend profile in the main landmark with the guest notices', async () => {
    vi.mocked(getPublicProfile).mockResolvedValue(publicProfileFixture);

    const { container } = render(await UserProfileContent({ username: 'Samuel_Missionary' }));

    expect(getPublicProfile).toHaveBeenCalledWith('Samuel_Missionary');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('heading', { level: 1, name: /samuel mendonça/i })).toBeInTheDocument();
    expect(screen.getByText(/crie sua conta para acompanhar/i)).toBeInTheDocument();
    const jsonLd = container.querySelector('script[type="application/ld+json"]')?.textContent;
    expect(jsonLd).toContain('Samuel Mendonça');
    expect(jsonLd).toContain('/user/samuel_missionary');
    // The example project shown in its tab never reaches the structured data.
    expect(jsonLd).not.toContain('Favela do Lixão');
  });

  it('answers 404 when there is no visible profile', async () => {
    vi.mocked(getPublicProfile).mockResolvedValue(null);

    await expect(UserProfileContent({ username: 'pendente' })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('passes the username from the params promise to the content', async () => {
    const element = await UserProfileBody({ params: Promise.resolve({ username: 'ana' }) });
    expect(element.props).toEqual({ username: 'ana' });
  });
});
