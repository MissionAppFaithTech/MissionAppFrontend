import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CampaignDetailView from './CampaignDetailView';
import { mockCampaign } from '@/mocks/campaign';

describe('CampaignDetailView component', () => {
  it('renders campaign hero title, subtitle, dates, and full description', () => {
    render(<CampaignDetailView campaign={mockCampaign} />);

    // Title & subtitle
    expect(screen.getByRole('heading', { level: 1, name: mockCampaign.title })).toBeInTheDocument();
    expect(screen.getByText(mockCampaign.subtitle)).toBeInTheDocument();

    // Official church day
    expect(
      screen.getAllByText(new RegExp(mockCampaign.churchDay, 'i')).length
    ).toBeGreaterThanOrEqual(1);

    // Associated impact projects
    expect(
      screen.getByRole('heading', { name: /projetos de impacto vinculados/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Projeto social na favela do Lixão')).toBeInTheDocument();
  });

  it('opens DonationModal when clicking "Ofertar na Campanha"', async () => {
    const user = userEvent.setup();
    render(<CampaignDetailView campaign={mockCampaign} />);

    const ofertarBtn = screen.getByRole('button', { name: /ofertar na campanha/i });
    await user.click(ofertarBtn);

    expect(screen.getByRole('heading', { name: /ofertar na missão/i })).toBeInTheDocument();
  });

  it('copies current URL to clipboard and displays toast when clicking share button', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });

    render(<CampaignDetailView campaign={mockCampaign} />);

    const shareBtn = screen.getByRole('button', { name: /compartilhar campanha/i });
    await user.click(shareBtn);

    expect(writeTextMock).toHaveBeenCalledWith(window.location.href);
    expect(
      await screen.findByText(/link copiado para a área de transferência!/i)
    ).toBeInTheDocument();
  });
});
