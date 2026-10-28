'use client';

import { useTheme } from 'next-themes';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import useHasMounted from '@/lib/useHasMounted';
import { useThemeStore } from '@/stores/themeStore';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const zustandMode = useThemeStore((s) => s.mode);
  const toggleZustandMode = useThemeStore((s) => s.toggleMode);

  if (!mounted) {
    return <IconButton aria-label="Alternar tema" size="large" disabled />;
  }

  const isDark = (resolvedTheme || zustandMode) === 'dark';

  const handleToggle = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    toggleZustandMode();
  };

  return (
    <IconButton
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      onClick={handleToggle}
      size="large"
      sx={{ color: 'inherit' }}
    >
      {isDark ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}
