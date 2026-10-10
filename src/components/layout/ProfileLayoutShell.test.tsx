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

function expectStandardNavbar() {
  expect(screen.getByAltText(/mission app/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /abrir menu do perfil/i })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /^voltar$/i })).not.toBeInTheDocument();
  expect(screen.queryByText('Editar Perfil')).not.toBeInTheDocument();
  expect(screen.queryByText('Editar Perfil de Apoiador')).not.toBeInTheDocument();
}

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

      expectStandardNavbar();
      expect(screen.getByText(mockProfile.displayName)).toBeInTheDocument();
      expect(screen.getByText('Profile Tab Content')).toBeInTheDocument();
      expect(
        screen.getByRole('navigation', { name: /navegação móvel do missionário/i })
      ).toBeInTheDocument();
    });
  });

  describe('Edit pages (same navbar, no summary card or bottom nav)', () => {
    it('keeps the standard navbar on missionary edit profile page', () => {
      mockPathname = '/profile/edit-profile';
      render(
        <ProfileLayoutShell profile={mockProfile} role="missionary">
          <div>Formulário de Edição de Perfil</div>
        </ProfileLayoutShell>
      );

      expectStandardNavbar();
      expect(
        screen.queryByRole('navigation', { name: /navegação móvel/i })
      ).not.toBeInTheDocument();
      expect(screen.queryByText(mockProfile.roleDescription!)).not.toBeInTheDocument();
      expect(screen.getByText('Formulário de Edição de Perfil')).toBeInTheDocument();
    });

    it('keeps the standard navbar on impact project edit page', () => {
      mockPathname = '/profile/projetos-de-impacto/edit';
      render(
        <ProfileLayoutShell profile={mockProfile} role="missionary">
          <div>Formulário de Edição de Projeto</div>
        </ProfileLayoutShell>
      );

      expectStandardNavbar();
      expect(
        screen.queryByRole('navigation', { name: /navegação móvel/i })
      ).not.toBeInTheDocument();
      expect(screen.getByText('Formulário de Edição de Projeto')).toBeInTheDocument();
    });

    it('keeps the standard navbar on supporter edit profile page', () => {
      mockPathname = '/profile/supporter/edit-profile';
      render(
        <ProfileLayoutShell profile={mockSupporterProfile} role="supporter">
          <div>Formulário de Edição do Apoiador</div>
        </ProfileLayoutShell>
      );

      expectStandardNavbar();
      expect(
        screen.queryByRole('navigation', { name: /navegação móvel/i })
      ).not.toBeInTheDocument();
      expect(screen.getByText('Formulário de Edição do Apoiador')).toBeInTheDocument();
    });

    it('keeps the standard navbar on financial settings page', () => {
      mockPathname = '/profile/financeiro';
      render(
        <ProfileLayoutShell profile={mockProfile} role="missionary">
          <div>Formulário de Configurações Financeiras</div>
        </ProfileLayoutShell>
      );

      expectStandardNavbar();
      expect(
        screen.queryByRole('navigation', { name: /navegação móvel/i })
      ).not.toBeInTheDocument();
      expect(screen.queryByText(mockProfile.roleDescription!)).not.toBeInTheDocument();
      expect(screen.getByText('Formulário de Configurações Financeiras')).toBeInTheDocument();
    });
  });
});
