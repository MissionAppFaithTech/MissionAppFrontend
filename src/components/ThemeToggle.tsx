'use client';

import { useTheme } from 'next-themes';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import useHasMounted from '@/lib/useHasMounted';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();

  if (!mounted) {
    return <IconButton aria-label="Alternar tema" size="large" disabled />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <IconButton
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      size="large"
      sx={{ color: 'inherit' }}
    >
      {isDark ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}
