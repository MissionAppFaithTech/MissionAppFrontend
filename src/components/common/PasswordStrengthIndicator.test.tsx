import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { colors } from '@/theme/theme';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

describe('PasswordStrengthIndicator', () => {
  it('lists every password rule for assistive tech', () => {
    render(<PasswordStrengthIndicator password="" />);

    expect(screen.getByRole('region', { name: /requisitos da senha/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/pelo menos 8 caracteres: faltando/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/uma letra minúscula: faltando/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/uma letra maiúscula: faltando/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/um número: faltando/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/caractere especial/i)).toBeInTheDocument();
  });

  it('marks met rules without relying on color alone', () => {
    render(<PasswordStrengthIndicator password="Aa1!" />);

    expect(screen.getByLabelText(/uma letra maiúscula: atendido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/uma letra minúscula: atendido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/um número: atendido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/caractere especial.*atendido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pelo menos 8 caracteres: faltando/i)).toBeInTheDocument();
    expect(getComputedStyle(screen.getByLabelText(/uma letra maiúscula: atendido/i)).color).toBe(
      hexToRgb(colors.success)
    );
    expect(
      getComputedStyle(screen.getByLabelText(/pelo menos 8 caracteres: faltando/i)).color
    ).toBe(hexToRgb(colors.textSecondary));
  });

  it('announces overall strength when the password is not empty', () => {
    render(<PasswordStrengthIndicator password="SenhaForte@123" />);

    expect(screen.getByText(/senha forte/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pelo menos 8 caracteres: atendido/i)).toBeInTheDocument();
  });
});

function hexToRgb(hex: string) {
  const value = hex.replace('#', '');
  const n = Number.parseInt(value, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}
