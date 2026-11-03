import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { cacheLife } from 'next/cache';
import { CampaignBody, CampaignContent } from './CampaignContent';
import { mockCampaign } from '@/mocks/campaign';

vi.mock('next/cache', () => ({ cacheLife: vi.fn() }));

describe('CampaignContent', () => {
  it('renders campaign hero, details and associated projects with the public cache profile', async () => {
    render(await CampaignContent({ id: 'campanha-educacao-esperanca' }));

    expect(screen.getByRole('heading', { level: 1, name: mockCampaign.title })).toBeInTheDocument();
    expect(screen.getByText(mockCampaign.subtitle)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ofertar na campanha/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /projetos de impacto vinculados/i })
    ).toBeInTheDocument();
    expect(cacheLife).toHaveBeenCalledWith('public');
  });

  it('passes the route id from the params promise to the cached content', async () => {
    const element = await CampaignBody({ params: Promise.resolve({ id: 'campanha-x' }) });
    expect(element.props).toEqual({ id: 'campanha-x' });
  });
});
