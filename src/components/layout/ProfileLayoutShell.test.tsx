import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileLayoutShell from './ProfileLayoutShell';
import { mockProfile, mockSupporterProfile } from '@/mocks/profile';

let mockPathname = '/profile';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('ProfileLayoutShell component', () => {
  beforeEach(() => {
    mockPathname = '/profile';
  });

  describe('Non-edit pages (Standard profile shell)', () => {
    it('renders top navbar, summary card, children, and mobile bottom nav bar', () => {
      mockPathname = '/profile';
      render(
        <ProfileLayoutShell profile={mockProfile} role="missionary">
          <div>Profile Tab Content</div>
        </ProfileLayoutShell>
      );

      // Top navbar elements
      expect(screen.getByAltText(/mission app/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /abrir menu do perfil/i })).toBeInTheDocument();

      // Profile summary card elements
      expect(screen.getByText(mockProfile.displayName)).toBeInTheDocument();

      // Main content
      expect(screen.getByText('Profile Tab Content')).toBeInTheDocument();

      // Mobile Bottom Nav Bar present
      expect(
        screen.getByRole('navigation', { name: /navegação móvel do missionário/i })
      ).toBeInTheDocument();
    });
  });

  describe('Edit pages (Free, unobstructed layout with only Back button)', () => {
    it('does NOT render bottom nav bar or summary card on missionary edit profile page', () => {
      mockPathname = '/profile/edit-profile';
      render(
        <ProfileLayoutShell profile={mockProfile} role="missionary">
          <div>Formulário de Edição de Perfil</div>
        </ProfileLayoutShell>
      );

      // NO bottom nav bar
      expect(
        screen.queryByRole('navigation', { name: /navegação móvel/i })
      ).not.toBeInTheDocument();

      // NO summary card
      expect(screen.queryByText(mockProfile.roleDescription!)).not.toBeInTheDocument();

      // NO account menu avatar dropdown
      expect(
        screen.queryByRole('button', { name: /abrir menu do perfil/i })
      ).not.toBeInTheDocument();

      // ONLY Back button and title
      const backBtn = screen.getByRole('link', { name: /voltar/i });
      expect(backBtn).toBeInTheDocument();
      expect(backBtn).toHaveAttribute('href', '/profile/sobre');
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();

      // Form rendered freely
      expect(screen.getByText('Formulário de Edição de Perfil')).toBeInTheDocument();
    });

    it('does NOT render bottom nav bar or summary card on impact project edit page', () => {
      mockPathname = '/profile/projetos-de-impacto/edit';
      render(
        <ProfileLayoutShell profile={mockProfile} role="missionary">
          <div>Formulário de Edição de Projeto</div>
        </ProfileLayoutShell>
      );

      // NO bottom nav bar
      expect(
        screen.queryByRole('navigation', { name: /navegação móvel/i })
      ).not.toBeInTheDocument();

      // ONLY Back button pointing to impact projects and title
      const backBtn = screen.getByRole('link', { name: /voltar/i });
      expect(backBtn).toBeInTheDocument();
      expect(backBtn).toHaveAttribute('href', '/profile/projetos-de-impacto');
      expect(screen.getByText('Editar Projeto de Impacto')).toBeInTheDocument();

      // Form rendered freely
      expect(screen.getByText('Formulário de Edição de Projeto')).toBeInTheDocument();
    });

    it('does NOT render bottom nav bar or summary card on supporter edit profile page', () => {
      mockPathname = '/profile/supporter/edit-profile';
      render(
        <ProfileLayoutShell profile={mockSupporterProfile} role="supporter">
          <div>Formulário de Edição do Apoiador</div>
        </ProfileLayoutShell>
      );

      // NO bottom nav bar
      expect(
        screen.queryByRole('navigation', { name: /navegação móvel/i })
      ).not.toBeInTheDocument();

      // ONLY Back button pointing to supporter home and title
      const backBtn = screen.getByRole('link', { name: /voltar/i });
      expect(backBtn).toBeInTheDocument();
      expect(backBtn).toHaveAttribute('href', '/profile/supporter');
      expect(screen.getByText('Editar Perfil de Apoiador')).toBeInTheDocument();

      // Form rendered freely
      expect(screen.getByText('Formulário de Edição do Apoiador')).toBeInTheDocument();
    });

    it('does NOT render bottom nav bar or summary card on financial settings page (/profile/financeiro)', () => {
      mockPathname = '/profile/financeiro';
      render(
        <ProfileLayoutShell profile={mockProfile} role="missionary">
          <div>Formulário de Configurações Financeiras</div>
        </ProfileLayoutShell>
      );

      // NO bottom nav bar
      expect(
        screen.queryByRole('navigation', { name: /navegação móvel/i })
      ).not.toBeInTheDocument();

      // NO summary card
      expect(screen.queryByText(mockProfile.roleDescription!)).not.toBeInTheDocument();

      // NO account menu avatar dropdown
      expect(
        screen.queryByRole('button', { name: /abrir menu do perfil/i })
      ).not.toBeInTheDocument();

      // ONLY Back button pointing to profile and title
      const backBtn = screen.getByRole('link', { name: /voltar/i });
      expect(backBtn).toBeInTheDocument();
      expect(backBtn).toHaveAttribute('href', '/profile/sobre');
      expect(screen.getByText('Configurações Financeiras')).toBeInTheDocument();

      // Form rendered freely
      expect(screen.getByText('Formulário de Configurações Financeiras')).toBeInTheDocument();
    });
  });
});
