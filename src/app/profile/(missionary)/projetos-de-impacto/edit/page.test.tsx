import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EditImpactProjectPage from '@/app/profile/(missionary)/projetos-de-impacto/edit/page';

describe('EditImpactProjectPage (/profile/projetos-de-impacto/edit)', () => {
  it('renders edit impact project page correctly with mock project data', () => {
    render(<EditImpactProjectPage />);

    expect(screen.getByRole('heading', { name: /editar projeto de impacto/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });
});
