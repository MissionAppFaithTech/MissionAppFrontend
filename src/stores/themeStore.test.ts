import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from './themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: 'light', hasHydrated: true });
    document.documentElement.classList.remove('dark');
  });

  it('starts with default light mode', () => {
    expect(useThemeStore.getState().mode).toBe('light');
  });

  it('toggles mode from light to dark and back', () => {
    const { toggleMode } = useThemeStore.getState();

    toggleMode();
    expect(useThemeStore.getState().mode).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    toggleMode();
    expect(useThemeStore.getState().mode).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('sets explicit theme mode', () => {
    const { setMode } = useThemeStore.getState();

    setMode('dark');
    expect(useThemeStore.getState().mode).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    setMode('light');
    expect(useThemeStore.getState().mode).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
