import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { featuredCampaign } from '@/lib/campaigns/featured';
import Home from './page';

const BRING_PATH = '/leve-o-mission-app-para-sua-igreja';

describe('Home page (Landing Page route /)', () => {
  it('leads with recurring campaigns and still offers missionaries to explore', () => {
    render(<Home />);

    const hero = screen.getByRole('heading', { level: 1 });
    expect(hero).toHaveTextContent(/campanhas\s*missionárias\s*que mobilizam\s*sua\s*igreja/i);
    expect(
      screen.getByText('Plataforma de mobilização e conscientização missionária.')
    ).toBeVisible();
    expect(screen.queryByText(/open-source/i)).not.toBeInTheDocument();

    const heroSection = hero.closest('section') as HTMLElement;
    expect(
      within(heroSection).getByRole('link', { name: 'Leve o Mission App para sua igreja' })
    ).toHaveAttribute('href', BRING_PATH);
    // Only the two essential actions in the hero.
    expect(within(heroSection).getAllByRole('link')).toHaveLength(2);
    expect(
      within(heroSection).getByRole('link', { name: 'Explorar Campanha Missionária' })
    ).toHaveAttribute('href', `/campanha/${featuredCampaign.id}`);
    expect(screen.getByRole('link', { name: 'Explorar missionários e projetos' })).toHaveAttribute(
      'href',
      '/navegacao'
    );
    expect(screen.getByRole('link', { name: /comece agora/i })).toHaveAttribute(
      'href',
      '/select-role'
    );
  });

  it('places "Leve o Mission App para sua igreja" across the page', () => {
    render(<Home />);

    const ctas = screen.getAllByRole('link', { name: 'Leve o Mission App para sua igreja' });
    // hero, campaign in effect, how the church adopts it, closing call and the footer
    expect(ctas.length).toBeGreaterThanOrEqual(5);
    for (const cta of ctas) expect(cta).toHaveAttribute('href', BRING_PATH);
    expect(screen.queryByText(/ver o kit e o qr code/i)).not.toBeInTheDocument();
  });

  it('shows the vision pillars, the campaign in effect and how the church adopts it', () => {
    render(<Home />);

    for (const pillar of [
      'Campanhas missionárias recorrentes',
      'Conselhos missionários fortalecidos',
      'Missionários e projetos para apoiar',
    ]) {
      expect(screen.getByRole('heading', { level: 3, name: pillar })).toBeInTheDocument();
    }

    const campaign = screen.getByRole('region', { name: featuredCampaign.title });
    expect(within(campaign).getByText(new RegExp(featuredCampaign.churchDay))).toBeVisible();
    expect(within(campaign).getByRole('link', { name: 'Ver a campanha' })).toHaveAttribute(
      'href',
      `/campanha/${featuredCampaign.id}`
    );

    const adoption = screen.getByRole('region', {
      name: 'Como a igreja adota as campanhas recorrentes do Mission App',
    });
    expect(within(adoption).getAllByRole('listitem')).toHaveLength(3);
    expect(within(adoption).getByText(/o mission app define o dia oficial/i)).toBeVisible();
  });

  it('presents the three audiences, the campaign FAQ and the footer links', () => {
    render(<Home />);

    expect(screen.getByText('Para Igrejas & Conselhos missionários')).toBeInTheDocument();
    expect(screen.getByText('Para Missionários')).toBeInTheDocument();
    expect(screen.getByText('Para Apoiadores & Mobilizadores')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'O que são as campanhas missionárias recorrentes?' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Como minha igreja adota uma campanha?' })
    ).toBeInTheDocument();

    const footerNav = screen.getByRole('navigation', { name: 'Links do rodapé' });
    expect(within(footerNav).getByRole('link', { name: 'Conselho missionário' })).toHaveAttribute(
      'href',
      '/conselho-missionario'
    );
    expect(
      within(footerNav).getByRole('link', { name: 'Leve o Mission App para sua igreja' })
    ).toHaveAttribute('href', BRING_PATH);
  });
});
