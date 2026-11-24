import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CampaignPage from './page';
import { mockCampaign } from '@/mocks/campaign';

describe('Profile Campaign Page', () => {
  it('renders missionary campaign section with campaign data and action buttons', () => {
    render(<CampaignPage />);

    expect(screen.getByRole('heading', { name: mockCampaign.title })).toBeInTheDocument();
    expect(screen.getByText(mockCampaign.subtitle)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ofertar na campanha/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver página da campanha/i })).toBeInTheDocument();
  });
});
