import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AboutMissionAppSection from './AboutMissionAppSection';

describe('AboutMissionAppSection', () => {
  it('explains what the Mission App is, its vision, purpose and tools', () => {
    render(<AboutMissionAppSection />);

    const region = screen.getByRole('region', { name: 'O que é o Mission App' });
    expect(
      within(region).getByText(/plataforma de mobilização e conscientização missionária/i)
    ).toBeVisible();
    for (const pillar of ['Visão', 'Propósito', 'Ferramentas de mobilização']) {
      expect(within(region).getByRole('heading', { level: 3, name: pillar })).toBeInTheDocument();
    }
    expect(within(region).queryByText(/open-source/i)).not.toBeInTheDocument();
    // "Conselho missionário" always together
    expect(region.textContent).not.toMatch(/\bconselhos?\b(?! mission)/i);
  });

  it('shows how to bring it to the church, linking to the campaign and the council guide', () => {
    render(<AboutMissionAppSection />);

    expect(
      screen.getByRole('heading', { name: 'Como levar o Mission App para sua igreja' })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByRole('link', { name: 'Ver a campanha recorrente' })).toHaveAttribute(
      'href',
      '#campanha-recorrente'
    );
    expect(screen.getByRole('link', { name: 'Criar uma conta' })).toHaveAttribute(
      'href',
      '/select-role'
    );
    expect(
      screen.getByRole('link', { name: 'Aprender a fundar o conselho missionário' })
    ).toHaveAttribute('href', '/conselho-missionario#checklist');
  });
});
