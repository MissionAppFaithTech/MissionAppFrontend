import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import VisitorProfileView from './VisitorProfileView';
import { mockCampaign } from '@/mocks/campaign';
import { mockProfile, mockSavedPosts } from '@/mocks/profile';

describe('VisitorProfileView component', () => {
  it('renders profile card, guest CTA banner, and tabs including Sobre and Projetos', () => {
    render(<VisitorProfileView profile={mockProfile} posts={mockSavedPosts} />);

    // Profile summary card
    expect(screen.getByText(mockProfile.displayName)).toBeInTheDocument();

    // Guest CTA
    expect(screen.getByText(/crie sua conta para acompanhar/i)).toBeInTheDocument();

    // Tabs: Sobre, Projetos de Impacto, Postagens, Campanha
    expect(screen.getByRole('tab', { name: /sobre/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /projetos/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /postagens/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /campanha/i })).toBeInTheDocument();
  });

  it('switches between tabs on click and renders corresponding sections', async () => {
    const user = userEvent.setup();
    render(<VisitorProfileView profile={mockProfile} posts={mockSavedPosts} />);

    // Default tab is 'Sobre' which contains VisitorProfileAboutSection
    expect(screen.getByText(/resumo da história em missões/i)).toBeInTheDocument();

    // Switch to 'Projetos'
    const projetosTab = screen.getByRole('tab', { name: /projetos/i });
    await user.click(projetosTab);

    expect(
      screen.getByRole('heading', { name: /projeto social na favela do lixão/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ofertar/i })).toBeInTheDocument();

    // Switch to 'Postagens'
    const postagensTab = screen.getByRole('tab', { name: /postagens/i });
    await user.click(postagensTab);

    expect(screen.getByText(/veja todas as postagens e orações/i)).toBeInTheDocument();

    // Switch to 'Campanha'
    const campanhaTab = screen.getByRole('tab', { name: /campanha/i });
    await user.click(campanhaTab);

    expect(screen.getByRole('heading', { name: mockCampaign.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ofertar na campanha/i })).toBeInTheDocument();
  });

  it('labels only the tabs that still show example data', async () => {
    const user = userEvent.setup();
    render(<VisitorProfileView profile={{ ...mockProfile, statsAreExample: false }} />);

    expect(screen.queryByText('Dados de exemplo')).not.toBeInTheDocument();

    for (const [tab, subject] of [
      [/projetos/i, 'projetos de impacto'],
      [/postagens/i, 'postagens'],
      [/campanha/i, 'campanha'],
    ] as const) {
      await user.click(screen.getByRole('tab', { name: tab }));
      expect(
        screen.getByLabelText(`Dados de exemplo: ${subject} ainda não disponíveis`)
      ).toBeInTheDocument();
    }

    await user.click(screen.getByRole('tab', { name: /sobre/i }));
    expect(screen.queryByText('Dados de exemplo')).not.toBeInTheDocument();
  });
});
