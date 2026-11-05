import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mockCampaign } from '@/mocks/campaign';
import CampaignAdoptionGuide, { MEDIA_KIT_ITEMS } from './CampaignAdoptionGuide';

const STEP_TITLES = [
  'Baixe o Kit de Mídia do Culto de Missões',
  'Adote o Dia Oficial da campanha',
  'Exiba o QR Code da campanha',
];

describe('CampaignAdoptionGuide', () => {
  it('summary: explains the problem and the three steps, and links to the full guide', () => {
    render(<CampaignAdoptionGuide campaign={mockCampaign} variant="summary" headingId="h" />);

    const region = screen.getByRole('region', {
      name: 'Como a igreja adota as campanhas recorrentes do Mission App',
    });
    expect(within(region).getByText('O problema comum')).toBeVisible();
    const steps = within(region).getAllByRole('listitem');
    expect(steps.map((step) => within(step).getByRole('heading').textContent)).toEqual(STEP_TITLES);
    expect(
      within(region).getByText(`Dia Oficial da campanha vigente: ${mockCampaign.churchDay}`)
    ).toBeVisible();
    // The Mission App sets the official day; the church only adopts it.
    expect(within(region).getByText(/o mission app define o dia oficial/i)).toBeVisible();
    expect(
      within(region).getByRole('link', { name: 'Leve o Mission App para sua igreja' })
    ).toHaveAttribute('href', '/leve-o-mission-app-para-sua-igreja');
    expect(
      within(region).getByRole('link', { name: 'Conhecer a campanha vigente' })
    ).toHaveAttribute('href', `/campanha/${mockCampaign.id}`);
    // The summary keeps the kit and the QR code for the church guide.
    expect(within(region).queryByRole('img', { name: /QR Code/ })).not.toBeInTheDocument();
  });

  it('full: lists the media kit as "Em breve" and shows the campaign QR code', () => {
    render(<CampaignAdoptionGuide campaign={mockCampaign} variant="full" headingId="h" />);

    for (const item of MEDIA_KIT_ITEMS) {
      expect(screen.getByRole('heading', { name: item.title })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: `${item.title}: download em breve` })
      ).toBeDisabled();
    }
    // Not only a disabled button: the state is also written (WCAG 1.4.1).
    expect(screen.getAllByText('Em breve')).toHaveLength(MEDIA_KIT_ITEMS.length);
    expect(
      screen.getByRole('img', {
        name: `QR Code que abre a página da campanha ${mockCampaign.title}`,
      })
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Leve o Mission App para sua igreja' })).toBeNull();
    vi.restoreAllMocks();
  });
});
