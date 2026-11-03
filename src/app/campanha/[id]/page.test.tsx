import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CampaignPage, { generateMetadata } from './page';
import { mockCampaign } from '@/mocks/campaign';

vi.mock('./CampaignContent', () => ({
  CampaignBody: () => <div data-testid="campaign-body" />,
}));

describe('Dedicated Campaign Page (/campanha/[id])', () => {
  it('renders the visitor shell around the streamed campaign body', () => {
    render(CampaignPage({ params: Promise.resolve({ id: 'campanha-educacao-esperanca' }) }));

    expect(screen.getByTestId('campaign-body')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^entrar$/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('generates correct metadata and OpenGraph tags for the campaign', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: 'campanha-educacao-esperanca' }),
    });

    expect(metadata.title).toContain(mockCampaign.title);
    expect(metadata.description).toBe(mockCampaign.subtitle);
    expect((metadata.openGraph as Record<string, unknown>)?.type).toBe('article');
  });
});
