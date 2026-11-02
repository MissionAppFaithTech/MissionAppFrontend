import { render, screen } from '@testing-library/react';
import { useColorScheme } from '@mui/material/styles';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppThemeProvider } from './AppThemeProvider';

let resolvedTheme: string | undefined = 'dark';
vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme, setTheme: vi.fn() }) }));

function MuiMode() {
  const { mode } = useColorScheme();
  return <p data-testid="mui-mode">{mode}</p>;
}

function renderProvider() {
  return render(
    <AppThemeProvider>
      <MuiMode />
    </AppThemeProvider>
  );
}

describe('AppThemeProvider', () => {
  beforeEach(() => {
    resolvedTheme = 'dark';
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('drops the legacy zustand theme key and leaves next-themes as the only theme storage', () => {
    window.localStorage.setItem('missionapp_theme_mode_v1', '{"state":{"mode":"light"}}');
    window.localStorage.setItem('theme', 'dark');

    renderProvider();

    expect(window.localStorage.getItem('missionapp_theme_mode_v1')).toBeNull();
    expect(window.localStorage.getItem('theme')).toBe('dark');
  });

  it.each([
    ['dark', 'dark'],
    ['light', 'light'],
    ['system', 'light'],
  ])('mirrors next-themes %s into MUI as %s', (theme, mode) => {
    resolvedTheme = theme;
    renderProvider();

    expect(screen.getByTestId('mui-mode')).toHaveTextContent(mode);
  });

  it('starts from the dark class next-themes already put on <html>', () => {
    resolvedTheme = undefined;
    document.documentElement.classList.add('dark');
    renderProvider();

    expect(screen.getByTestId('mui-mode')).toHaveTextContent('dark');
  });

  it('starts light without the dark class while next-themes has not resolved', () => {
    resolvedTheme = undefined;
    renderProvider();

    expect(screen.getByTestId('mui-mode')).toHaveTextContent('light');
  });
});
