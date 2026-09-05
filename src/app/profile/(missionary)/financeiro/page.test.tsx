import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FinancialSettingsPage from './page';

describe('FinancialSettingsPage (/profile/financeiro)', () => {
  it('renders financial configuration page with title, methods and save button', () => {
    render(<FinancialSettingsPage />);

    expect(screen.getByRole('heading', { name: /configurações financeiras/i })).toBeInTheDocument();
    expect(screen.getByText(/status: ativo/i)).toBeInTheDocument();
    expect(screen.getByText(/doação via pix simples/i)).toBeInTheDocument();
    expect(screen.getByText(/transferência bancária/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /visualizar prévia do apoiador/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar configurações/i })).toBeInTheDocument();
  });
});
