'use client';

import { useTheme } from 'next-themes';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import useHasMounted from '@/lib/useHasMounted';

type ThemeModeSwitchProps = {
  /** Id of the visible "Aparência" label that names the group. */
  labelledBy: string;
};

const OPTIONS = [
  { value: 'light', label: 'Claro', icon: <LightModeOutlinedIcon aria-hidden fontSize="small" /> },
  { value: 'dark', label: 'Escuro', icon: <DarkModeOutlinedIcon aria-hidden fontSize="small" /> },
] as const;

/**
 * Quick light/dark switch (account menu and settings). next-themes owns the
 * choice; `AppThemeProvider` mirrors it into MUI and the theme store. The
 * selected option shows a filled style plus `aria-pressed`, not color alone.
 */
export default function ThemeModeSwitch({ labelledBy }: ThemeModeSwitchProps) {
  const { resolvedTheme, setTheme } = useTheme();
  // The resolved theme is only known on the client; render nothing selected before that.
  const mounted = useHasMounted();
  const current = mounted ? (resolvedTheme === 'dark' ? 'dark' : 'light') : null;

  return (
    <ToggleButtonGroup
      exclusive
      fullWidth
      value={current}
      onChange={(_, next: 'light' | 'dark' | null) => {
        if (next) setTheme(next);
      }}
      aria-labelledby={labelledBy}
      sx={{
        p: 0.5,
        gap: 0.5,
        borderRadius: '12px',
        bgcolor: 'action.hover',
        '& .MuiToggleButtonGroup-grouped': {
          border: 0,
          borderRadius: '10px !important',
          m: 0,
        },
      }}
    >
      {OPTIONS.map((option) => (
        <ToggleButton
          key={option.value}
          value={option.value}
          sx={{
            minHeight: 44,
            gap: 1,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: 'text.secondary',
            '&.Mui-selected, &.Mui-selected:hover': {
              bgcolor: 'background.paper',
              color: 'text.primary',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.2)',
            },
          }}
        >
          {option.icon}
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
