import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChurchCouncilGuidePage from './page';

describe('ChurchCouncilGuidePage (/conselho-missionario)', () => {
  it('renders page layout with main landmark and guide view content', () => {
    render(<ChurchCouncilGuidePage />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /guia prático do conselho missionário & mobilização da igreja/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voltar para o início/i })).toHaveAttribute(
      'href',
      '/'
    );
  });
});
