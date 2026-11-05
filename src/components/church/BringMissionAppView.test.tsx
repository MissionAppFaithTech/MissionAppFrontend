import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mockCampaign } from '@/mocks/campaign';
import BringMissionAppView from './BringMissionAppView';

describe('BringMissionAppView', () => {
  it('opens with what the Mission App is, then the campaign up to its QR code', () => {
    render(<BringMissionAppView />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Leve o Mission App para sua igreja' })
    ).toBeInTheDocument();
    const about = screen.getByRole('region', { name: 'O que é o Mission App' });
    const adoption = screen.getByRole('region', {
      name: 'Como a igreja adota as campanhas recorrentes do Mission App',
    });
    // NOTE: DOCUMENT_POSITION_FOLLOWING — the adoption guide comes after the about section
    expect(about.compareDocumentPosition(adoption) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      within(adoption).getByRole('img', {
        name: `QR Code que abre a página da campanha ${mockCampaign.title}`,
      })
    ).toBeInTheDocument();
  });

  it('ends with the mobilizers call that leads to the council guide', () => {
    render(<BringMissionAppView />);

    const callout = screen.getByRole('region', {
      name: 'Forme um grupo de mobilizadores na sua igreja',
    });
    expect(within(callout).getAllByRole('listitem')).toHaveLength(3);
    expect(
      within(callout).getByRole('link', { name: 'Aprenda como fundar um conselho missionário' })
    ).toHaveAttribute('href', '/conselho-missionario');
    // The council materials live on their own page now.
    expect(screen.queryByText(/progresso de implantação/i)).not.toBeInTheDocument();
  });
});
