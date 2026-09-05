import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CampaignBadge from './CampaignBadge';

describe('CampaignBadge component', () => {
  it('renders default badge label', () => {
    render(<CampaignBadge />);
    expect(screen.getByText('Selo Oficial de Campanha')).toBeInTheDocument();
  });

  it('renders custom badge label', () => {
    render(<CampaignBadge label="Campanha Especial 2026" size="small" />);
    expect(screen.getByText('Campanha Especial 2026')).toBeInTheDocument();
  });

  it('renders hero variant with glassmorphic styling', () => {
    render(<CampaignBadge variant="hero" label="Selo Oficial de Campanha" />);
    expect(screen.getByText('Selo Oficial de Campanha')).toBeInTheDocument();
  });
});

