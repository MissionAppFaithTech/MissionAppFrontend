import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ThemeToggle from './ThemeToggle';

const setTheme = vi.fn();
let resolvedTheme = 'light';
vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme, setTheme }) }));
let mounted = true;
vi.mock('@/lib/useHasMounted', () => ({ default: () => mounted }));

describe('ThemeToggle', () => {
  beforeEach(() => {
    setTheme.mockClear();
    resolvedTheme = 'light';
    mounted = true;
  });

  it('switches a light page to dark through next-themes', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Ativar modo escuro' }));

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('switches a dark page back to light', async () => {
    resolvedTheme = 'dark';
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Ativar modo claro' }));

    expect(setTheme).toHaveBeenCalledWith('light');
  });

  it('renders a disabled placeholder until hydration, when the theme is still unknown', () => {
    mounted = false;
    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: 'Alternar tema' })).toBeDisabled();
  });
});
