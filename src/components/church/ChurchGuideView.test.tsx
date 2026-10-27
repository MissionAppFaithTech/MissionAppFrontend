import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ChurchGuideView from './ChurchGuideView';
import {
  CHECKLIST_PHASES,
  COUNCIL_ROLES,
  CADENCE_ITEMS,
  REFERENCE_INSTITUTIONS,
} from './churchGuideData';

describe('ChurchGuideView Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders hero title, description, and quick-navigation tabs', () => {
    render(<ChurchGuideView />);

    expect(
      screen.getByRole('heading', {
        name: /guia prático do conselho missionário & mobilização da igreja/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/guia prático para igrejas locais/i)).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: /passo a passo/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /funções do conselho/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /curso em vídeo/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /mobilização anual/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /hub de agências/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /modelos copiáveis/i })).toBeInTheDocument();
  });

  describe('Section 1: Interactive Checklist', () => {
    it('renders all 5 phases with initial 0% progress and updates progress on check', async () => {
      const user = userEvent.setup();
      render(<ChurchGuideView />);

      expect(screen.getByText(/progresso de implantação do conselho/i)).toBeInTheDocument();

      // Check all 5 phases are rendered
      CHECKLIST_PHASES.forEach((phase) => {
        expect(screen.getByText(phase.title)).toBeInTheDocument();
        expect(screen.getByText(phase.action)).toBeInTheDocument();
        expect(screen.getByText(phase.guideline)).toBeInTheDocument();
      });

      // Initially 0%
      expect(screen.getByText('0% Concluído')).toBeInTheDocument();

      // Check Phase 1
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(CHECKLIST_PHASES.length);
      await user.click(checkboxes[0]);

      // Now 20%
      await waitFor(() => {
        expect(screen.getByText('20% Concluído')).toBeInTheDocument();
      });

      // Verify localStorage persistence
      const saved = JSON.parse(
        localStorage.getItem('missionapp_church_council_checklist_v1') || '[]'
      );
      expect(saved).toContain('fase-1');

      // Click Reset button
      const resetBtn = screen.getByRole('button', { name: /reiniciar progresso/i });
      expect(resetBtn).toBeInTheDocument();
      await user.click(resetBtn);

      await waitFor(() => {
        expect(screen.getByText('0% Concluído')).toBeInTheDocument();
      });
    });
  });

  describe('Section 2: Council Roles (5 Essential Functions)', () => {
    it('renders all 5 essential council roles with badges and descriptions', () => {
      render(<ChurchGuideView />);

      expect(
        screen.getByRole('heading', {
          name: /estrutura e atribuições do conselho/i,
        })
      ).toBeInTheDocument();

      COUNCIL_ROLES.forEach((role) => {
        expect(screen.getByText(role.title)).toBeInTheDocument();
        expect(screen.getByText(role.roleBadge)).toBeInTheDocument();
        expect(screen.getByText(role.description)).toBeInTheDocument();
      });
    });
  });

  describe('Section: Video Playlist Course', () => {
    it('renders video playlist course with embedded player and direct YouTube link', () => {
      render(<ChurchGuideView />);

      expect(
        screen.getByRole('heading', {
          name: /playlist & curso: como criar um conselho missionário/i,
        })
      ).toBeInTheDocument();

      const iframe = screen.getByTitle(/playlist do curso: como criar um conselho missionário/i);
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        'src',
        'https://www.youtube-nocookie.com/embed/videoseries?list=PLx9r8HFZxYktUoAsr5ZiJ_xQdqq1WP03c'
      );

      const playlistLink = screen.getByRole('link', {
        name: /assistir playlist no youtube/i,
      });
      expect(playlistLink).toHaveAttribute(
        'href',
        'https://youtube.com/playlist?list=PLx9r8HFZxYktUoAsr5ZiJ_xQdqq1WP03c&si=Ugd84sduFOQdVehT'
      );
      expect(playlistLink).toHaveAttribute('target', '_blank');
      expect(playlistLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Section 3: Mobilization Cadence (Annual Timeline)', () => {
    it('renders all 4 cadence periods: Semanal, Mensal, Semestral, and Anual', () => {
      render(<ChurchGuideView />);

      expect(
        screen.getByRole('heading', {
          name: /plano prático de mobilização anual da igreja/i,
        })
      ).toBeInTheDocument();

      CADENCE_ITEMS.forEach((cadence) => {
        expect(screen.getByText(cadence.period)).toBeInTheDocument();
        expect(screen.getByText(cadence.title)).toBeInTheDocument();
        expect(screen.getByText(cadence.actionItem)).toBeInTheDocument();
      });
    });
  });

  describe('Section 4: Materials Hub & Category Filter', () => {
    it('renders materials hub with institutions and filter chips', async () => {
      const user = userEvent.setup();
      render(<ChurchGuideView />);

      expect(
        screen.getByRole('heading', {
          name: /hub de instituições, links e materiais de referência/i,
        })
      ).toBeInTheDocument();

      // Check institutions headings and logos are rendered
      REFERENCE_INSTITUTIONS.forEach((inst) => {
        expect(screen.getByRole('heading', { level: 4, name: inst.shortName })).toBeInTheDocument();
        const logo = screen.getByAltText(new RegExp(`Logotipo da ${inst.name}`, 'i'));
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('src', inst.logoUrl);
      });

      // Specifically verify JMN logo image
      const jmnLogo = screen.getByAltText(/logotipo da junta de missões nacionais/i);
      expect(jmnLogo).toHaveAttribute('src', '/images/institutions/jmn.png');

      // Check external links contain target="_blank" and rel="noopener noreferrer"
      const jmmLink = screen.getByRole('link', { name: /portal de mobilização jmm/i });
      expect(jmmLink).toHaveAttribute('href', 'https://missoesmundiais.com.br/mobilize');
      expect(jmmLink).toHaveAttribute('target', '_blank');
      expect(jmmLink).toHaveAttribute('rel', 'noopener noreferrer');

      // Click filter 'Capacitação'
      const capacitationChip = screen.getByRole('button', { name: /^capacitação$/i });
      await user.click(capacitationChip);

      // In Capacitação, only Perspectivas Brasil should remain
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 4, name: 'Perspectivas Brasil' })
        ).toBeInTheDocument();
        expect(screen.queryByRole('heading', { level: 4, name: 'APMT' })).not.toBeInTheDocument();
      });

      // Click 'Todos'
      const todosChip = screen.getByRole('button', { name: /^todos$/i });
      await user.click(todosChip);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 4, name: 'APMT' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 4, name: 'JMM' })).toBeInTheDocument();
      });
    });
  });

  describe('Section 5: Copyable Templates (1-Click Copy)', () => {
    it('renders copyable templates and handles one-click copy with visual feedback', async () => {
      const user = userEvent.setup();
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
        writable: true,
      });

      render(<ChurchGuideView />);

      expect(
        screen.getByRole('heading', {
          name: /templates prontos para copiar/i,
        })
      ).toBeInTheDocument();

      // Find copy button for Template 1 (Regimento Interno)
      const copyBtn = screen.getByRole('button', {
        name: /copiar template 1: modelo simplificado de regimento interno/i,
      });
      expect(copyBtn).toBeInTheDocument();

      await user.click(copyBtn);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled();
        expect(screen.getByText('Copiado!')).toBeInTheDocument();
      });
    });
  });
});
