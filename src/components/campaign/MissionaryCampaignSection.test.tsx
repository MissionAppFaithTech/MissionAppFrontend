import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import MissionaryCampaignSection from './MissionaryCampaignSection';
import { mockCampaign } from '@/mocks/campaign';

describe('MissionaryCampaignSection component', () => {
  it('renders campaign details, badge, churchDay, and action buttons', () => {
    render(<MissionaryCampaignSection campaign={mockCampaign} missionaryName="Samuel Mendonça" />);

    expect(screen.getByRole('heading', { name: mockCampaign.title })).toBeInTheDocument();
    expect(screen.getByText(mockCampaign.subtitle)).toBeInTheDocument();
    expect(screen.getByText(mockCampaign.badge)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockCampaign.churchDay, 'i'))).toBeInTheDocument();

    // "Ofertar" button
    expect(screen.getByRole('button', { name: /ofertar na campanha/i })).toBeInTheDocument();

    // "Ver Página da Campanha" link
    expect(screen.getByRole('link', { name: /ver página da campanha/i })).toHaveAttribute(
      'href',
      `/campanha/${mockCampaign.id}`
    );
  });

  it('opens DonationModal when clicking "Ofertar" button', async () => {
    const user = userEvent.setup();
    render(<MissionaryCampaignSection campaign={mockCampaign} missionaryName="Samuel Mendonça" />);

    const ofertarBtn = screen.getByRole('button', { name: /ofertar na campanha/i });
    await user.click(ofertarBtn);

    expect(screen.getByRole('heading', { name: /ofertar na missão/i })).toBeInTheDocument();
    expect(screen.getByText(/apoie o ministério de samuel mendonça/i)).toBeInTheDocument();
  });

  it('renders informative empty state when campaign is null', () => {
    render(<MissionaryCampaignSection campaign={null} />);

    expect(
      screen.getByRole('heading', { name: /nenhuma campanha ativa no momento/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/as campanhas de divulgação são criadas e promovidas oficialmente/i)
    ).toBeInTheDocument();
  });
});
