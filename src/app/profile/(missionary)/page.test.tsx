import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImpactProjectsPage from './projetos-de-impacto/page';
import ProfilePage from './page';
import ProfileAboutPage from './sobre/page';

const mockRedirect = vi.fn();
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    redirect: (url: string) => mockRedirect(url),
    usePathname: () => '/profile/sobre',
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
  };
});

describe('Missionary Profile routes', () => {
  it('renders the missionary sobre page with every field to fill marked "A definir"', () => {
    render(<ProfileAboutPage />);

    expect(screen.getByRole('heading', { name: /^sobre$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Biografia' })).toBeInTheDocument();
    expect(screen.getAllByText('A definir').length).toBeGreaterThan(0);
  });

  it('renders missionary impact projects page with impact project card', () => {
    render(<ImpactProjectsPage />);

    expect(
      screen.getByRole('heading', { name: /projeto social na favela do lixão/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ofertar/i })).toBeInTheDocument();
  });

  it('redirects root profile page to /profile/sobre', () => {
    mockRedirect.mockClear();
    ProfilePage();
    expect(mockRedirect).toHaveBeenCalledWith('/profile/sobre');
  });
});
