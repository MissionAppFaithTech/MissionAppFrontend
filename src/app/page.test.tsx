import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { featuredCampaign } from '@/lib/campaigns/featured';
import Home from './page';

describe('Home page (Landing Page route /)', () => {
  it('leads with recurring campaigns and still offers missionaries to explore', () => {
    render(<Home />);

    const hero = screen.getByRole('heading', { level: 1 });
    expect(hero).toHaveTextContent(/campanhas\s*missionárias\s*que mobilizam\s*sua\s*igreja/i);
    expect(
      screen.getByText(/plataforma de mobilização e conscientização missionária que divulga/i)
    ).toBeVisible();
    expect(screen.queryByText(/open-source/i)).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Conheça a campanha vigente' })).toHaveAttribute(
      'href',
      `/campanha/${featuredCampaign.id}`
    );
    expect(screen.getByRole('link', { name: 'Explorar missionários' })).toHaveAttribute(
      'href',
      '/navegacao'
    );
    expect(screen.getByRole('link', { name: 'Explorar missionários e projetos' })).toHaveAttribute(
      'href',
      '/navegacao'
    );
    expect(screen.getByRole('link', { name: /comece agora/i })).toHaveAttribute(
      'href',
      '/select-role'
    );
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
    expect(within(campaign).getByRole('link', { name: 'Levar para minha igreja' })).toHaveAttribute(
      'href',
      '/conselho-missionario#campanha-recorrente'
    );

    const adoption = screen.getByRole('region', {
      name: 'Como a igreja adota as campanhas recorrentes do Mission App',
    });
    expect(within(adoption).getAllByRole('listitem')).toHaveLength(3);
    expect(within(adoption).getByText(/o problema comum/i)).toBeVisible();
  });

  it('presents the three audiences and the campaign FAQ', () => {
    render(<Home />);

    expect(screen.getByText('Para Igrejas & Conselhos missionários')).toBeInTheDocument();
    expect(screen.getByText('Para Missionários')).toBeInTheDocument();
    expect(screen.getByText('Para Apoiadores')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'O que são as campanhas missionárias recorrentes?' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Como minha igreja adota uma campanha?' })
    ).toBeInTheDocument();
  });
});
