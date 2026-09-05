import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CampaignPage, { generateMetadata } from './page';
import { mockCampaign } from '@/mocks/campaign';

describe('Dedicated Campaign Page (/campanha/[id])', () => {
  it('renders campaign hero, details and associated projects', async () => {
    const Component = await CampaignPage({
      params: Promise.resolve({ id: 'campanha-educacao-esperanca' }),
    });

    render(Component);

    expect(screen.getByRole('heading', { level: 1, name: mockCampaign.title })).toBeInTheDocument();
    expect(screen.getByText(mockCampaign.subtitle)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ofertar na campanha/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /projetos de impacto vinculados/i })
    ).toBeInTheDocument();
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
