import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VisitorBottomNav from './VisitorBottomNav';
import MobileNavigationBar from './MobileNavigationBar';

let mockCurrentPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => mockCurrentPathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('VisitorBottomNav and MobileNavigationBar components', () => {
  beforeEach(() => {
    mockCurrentPathname = '/';
  });

  describe('View 1: Usuário Não Registrado / Visitante (3 ícones minimalistas)', () => {
    it('renders 3 minimalist navigation links: Explorar, Navegar e Entrar', () => {
      render(<MobileNavigationBar isLoggedIn={false} searchHref="/navegacao" />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);

      expect(screen.getByRole('link', { name: /explorar/i })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: /navegar/i })).toHaveAttribute('href', '/navegacao');
      expect(screen.getByRole('link', { name: /entrar/i })).toHaveAttribute('href', '/login');
    });

    it('renders visitor navigation links through VisitorBottomNav component', () => {
      render(<VisitorBottomNav searchHref="/navegacao" searchLabel="Navegar" />);

      expect(screen.getByRole('link', { name: /explorar/i })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: /navegar/i })).toHaveAttribute('href', '/navegacao');
      expect(screen.getByRole('link', { name: /entrar/i })).toHaveAttribute('href', '/login');
    });
  });

  describe('View 2: Missionário (4 ícones: Perfil, Navegar, Projeto, Feed)', () => {
    it('renders 4 missionary navigation items with Projeto button and without Explorar', () => {
      render(<MobileNavigationBar isLoggedIn={true} role="missionary" searchHref="/navegacao" />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(4);

      expect(screen.getByRole('link', { name: /^perfil$/i })).toHaveAttribute('href', '/profile');
      expect(screen.getByRole('link', { name: /navegar/i })).toHaveAttribute('href', '/navegacao');
      expect(screen.getByRole('link', { name: /^projeto$/i })).toHaveAttribute(
        'href',
        '/profile/projetos-de-impacto'
      );
      expect(screen.getByRole('link', { name: /feed/i })).toHaveAttribute(
        'href',
        '/profile/postagens'
      );
      expect(screen.queryByRole('link', { name: /explorar/i })).not.toBeInTheDocument();
    });
  });

  describe('View 3: Usuário Comum / Apoiador (4 ícones: Feed, Navegar, Campanha, Meu Perfil)', () => {
    it('renders 4 supporter navigation items with Campanha button and without Explorar', () => {
      render(<MobileNavigationBar isLoggedIn={true} role="supporter" searchHref="/navegacao" />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(4);

      expect(screen.getByRole('link', { name: /feed/i })).toHaveAttribute(
        'href',
        '/profile/supporter'
      );
      expect(screen.getByRole('link', { name: /navegar/i })).toHaveAttribute('href', '/navegacao');
      expect(screen.getByRole('link', { name: /campanha/i })).toHaveAttribute(
        'href',
        '/campanha/campanha-educacao-esperanca'
      );
      expect(screen.getByRole('link', { name: /meu perfil/i })).toHaveAttribute(
        'href',
        '/profile/supporter/edit-profile'
      );
      expect(screen.queryByRole('link', { name: /explorar/i })).not.toBeInTheDocument();
    });

    it('allows custom campaignHref to lead to selected campaign', () => {
      render(
        <MobileNavigationBar
          viewMode="supporter"
          campaignHref="/campanha/campanha-esperanca-mocambique"
        />
      );
      expect(screen.getByRole('link', { name: /campanha/i })).toHaveAttribute(
        'href',
        '/campanha/campanha-esperanca-mocambique'
      );
    });
  });

  describe('Edit pages behavior (must be free of bottom nav bar)', () => {
    it('does not render bottom nav bar on missionary edit profile page', () => {
      mockCurrentPathname = '/profile/edit-profile';
      const { container } = render(<MobileNavigationBar viewMode="missionary" />);
      expect(container.firstChild).toBeNull();
    });

    it('does not render bottom nav bar on impact project edit page', () => {
      mockCurrentPathname = '/profile/projetos-de-impacto/edit';
      const { container } = render(<MobileNavigationBar viewMode="missionary" />);
      expect(container.firstChild).toBeNull();
    });

    it('does not render bottom nav bar on supporter edit profile page', () => {
      mockCurrentPathname = '/profile/supporter/edit-profile';
      const { container } = render(<MobileNavigationBar viewMode="supporter" />);
      expect(container.firstChild).toBeNull();
    });

    it('does not render bottom nav bar on missionary financial settings page (/profile/financeiro)', () => {
      mockCurrentPathname = '/profile/financeiro';
      const { container } = render(<MobileNavigationBar viewMode="missionary" />);
      expect(container.firstChild).toBeNull();
    });

    it('renders on edit pages if forceShow is explicitly true', () => {
      mockCurrentPathname = '/profile/edit-profile';
      render(<MobileNavigationBar viewMode="missionary" forceShow={true} />);
      expect(
        screen.getByRole('navigation', { name: /navegação móvel do missionário/i })
      ).toBeInTheDocument();
    });
  });

  describe('Direct viewMode override prop', () => {
    it('allows explicitly setting viewMode to visitor, missionary or supporter', () => {
      const { rerender } = render(<MobileNavigationBar viewMode="visitor" />);
      expect(screen.getAllByRole('link')).toHaveLength(3);

      rerender(<MobileNavigationBar viewMode="missionary" />);
      expect(screen.getAllByRole('link')).toHaveLength(4);
      expect(screen.getByRole('link', { name: /^perfil$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^projeto$/i })).toBeInTheDocument();

      rerender(<MobileNavigationBar viewMode="supporter" />);
      expect(screen.getAllByRole('link')).toHaveLength(4);
      expect(screen.getByRole('link', { name: /campanha/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /meu perfil/i })).toBeInTheDocument();
    });
  });
});
