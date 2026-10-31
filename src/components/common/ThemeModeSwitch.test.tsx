import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ThemeModeSwitch from './ThemeModeSwitch';

const setTheme = vi.fn();
let resolvedTheme = 'light';
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme, setTheme }),
}));

function renderSwitch() {
  return render(
    <>
      <span id="appearance-label">Aparência</span>
      <ThemeModeSwitch labelledBy="appearance-label" />
    </>
  );
}

describe('ThemeModeSwitch', () => {
  beforeEach(() => {
    setTheme.mockClear();
    resolvedTheme = 'light';
  });

  it('is a labelled group that marks the current theme as pressed', () => {
    renderSwitch();

    expect(screen.getByRole('group', { name: 'Aparência' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Claro' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Escuro' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches to dark and back to light in one tap', async () => {
    const user = userEvent.setup();
    renderSwitch();

    await user.click(screen.getByRole('button', { name: 'Escuro' }));
    expect(setTheme).toHaveBeenLastCalledWith('dark');

    resolvedTheme = 'dark';
    renderSwitch();
    await user.click(screen.getAllByRole('button', { name: 'Claro' })[1]);
    expect(setTheme).toHaveBeenLastCalledWith('light');
  });

  it('ignores a tap on the option that is already selected', async () => {
    const user = userEvent.setup();
    renderSwitch();

    await user.click(screen.getByRole('button', { name: 'Claro' }));

    expect(setTheme).not.toHaveBeenCalled();
  });
});
