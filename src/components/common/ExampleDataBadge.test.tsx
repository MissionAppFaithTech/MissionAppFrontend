import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExampleDataBadge from './ExampleDataBadge';

describe('ExampleDataBadge', () => {
  it('shows a visible text label, not only color', () => {
    render(<ExampleDataBadge />);
    expect(screen.getByText('Dados de exemplo')).toBeInTheDocument();
  });

  it('describes what is placeholder data to screen readers', () => {
    render(<ExampleDataBadge subject="estatísticas do perfil" />);
    expect(
      screen.getByLabelText('Dados de exemplo: estatísticas do perfil ainda não disponíveis')
    ).toBeInTheDocument();
  });
});
