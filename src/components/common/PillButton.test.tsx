import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
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
});
