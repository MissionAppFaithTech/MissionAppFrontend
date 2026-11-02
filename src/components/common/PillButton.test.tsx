import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BUTTON_BORDER_RADIUS, FORM_ACTION_BUTTON_SX } from '@/theme/theme';
import PillButton from './PillButton';

describe('PillButton component', () => {
  it('renders button with label', () => {
    render(<PillButton tone="cta">Clique Aqui</PillButton>);
    expect(screen.getByRole('button', { name: /clique aqui/i })).toBeInTheDocument();
  });

  it('renders link when href is passed', () => {
    render(
      <PillButton href="/login" tone="missionFilled">
        Entrar
      </PillButton>
    );
    const link = screen.getByRole('link', { name: /entrar/i });
    expect(link).toHaveAttribute('href', '/login');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<PillButton onClick={handleClick}>Ação</PillButton>);
    await user.click(screen.getByRole('button', { name: /ação/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('keeps the same rounded-rectangle radius for outline and filled actions', () => {
    render(
      <>
        <PillButton tone="primarySoftOutline">Voltar</PillButton>
        <PillButton tone="cta">Continuar</PillButton>
      </>
    );

    const back = screen.getByRole('button', { name: /voltar/i });
    const next = screen.getByRole('button', { name: /continuar/i });
    const backRadius = getComputedStyle(back).borderRadius;
    const nextRadius = getComputedStyle(next).borderRadius;

    expect(backRadius).toBe(nextRadius);
    expect(nextRadius).toBe(BUTTON_BORDER_RADIUS);
  });

  it('keeps the CTA fill tokens while loading instead of a blank disabled wash', () => {
    render(
      <>
        <PillButton tone="cta">Continuar</PillButton>
        <PillButton tone="cta" loading>
          Continuando
        </PillButton>
      </>
    );

    const enabled = screen.getByRole('button', { name: /continuar/i });
    const loading = screen.getByRole('button', { name: /continuando/i });
    const fill = getComputedStyle(enabled).getPropertyValue('--pill-bg').trim();

    expect(loading).toHaveClass('MuiButton-loading');
    expect(fill).not.toBe('');
    expect(getComputedStyle(loading).getPropertyValue('--pill-bg').trim()).toBe(fill);
    expect(getComputedStyle(loading).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  it('keeps Voltar and Salvar on the shared action token with a 44px target everywhere', () => {
    expect(FORM_ACTION_BUTTON_SX.minHeight).toBe(44);
    expect(FORM_ACTION_BUTTON_SX.minWidth).toEqual({ xs: 0, sm: 108 });

    render(
      <>
        <PillButton tone="primarySoftOutline">Voltar</PillButton>
        <PillButton tone="primaryFilled">Salvar</PillButton>
      </>
    );

    expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });
});
