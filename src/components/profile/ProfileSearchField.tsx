'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { KeyboardEvent } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';

type ProfileSearchFieldProps = {
  placeholder?: string;
  maxWidth?: { xs: number; sm: number; md: number } | number;
  href?: string;
};

export default function ProfileSearchField({
  placeholder = 'Pesquisar missionário',
  maxWidth = { xs: 150, sm: 240, md: 280 },
  href = '/navegacao',
}: ProfileSearchFieldProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigate = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    // The route change might take a short moment, leaving the spinner active
    router.push(href);
    
    // Fallback: reset state if component stays mounted (e.g., navigated to same page or back)
    setTimeout(() => {
      setIsNavigating(false);
    }, 2500);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigate();
    }
  };

  return (
    <TextField
      placeholder={placeholder}
      size="small"
      aria-label={placeholder}
      data-testid="profile-search-field"
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              {isNavigating ? (
                <CircularProgress 
                  size={16} 
                  sx={{ 
                    color: (t) => (t.palette.mode === 'dark' ? 'accent.main' : 'primary.main'),
                    ml: 0.5,
                  }} 
                />
              ) : (
                <SearchIcon
                  sx={{
                    fontSize: 18,
                    color: (t) => (t.palette.mode === 'dark' ? 'text.primary' : 'primary.main'),
                    transition: 'color 0.2s ease',
                  }}
                />
              )}
            </InputAdornment>
          ),
        },
        htmlInput: {
          readOnly: true,
          style: { cursor: 'pointer' },
          role: 'button',
          tabIndex: 0,
        },
      }}
      sx={{
        cursor: 'pointer',
        width: '100%',
        maxWidth,
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isNavigating ? 'scale(0.98)' : 'none',
        '&:hover': {
          transform: isNavigating ? 'scale(0.98)' : 'scale(1.02)',
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
        '& .MuiOutlinedInput-root': {
          cursor: 'pointer',
          height: { xs: 34, sm: 36, md: 40 },
          // Fundo branco no light mode, fundo escuro translúcido no dark mode
          bgcolor: (t) =>
            t.palette.mode === 'dark' ? 'var(--mui-palette-action2-fieldBg)' : 'background.paper',
          borderRadius: 2,
          fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
          px: { xs: 0.5, sm: 1, md: 1.5 },
          transition: 'box-shadow 0.2s ease',
          '& fieldset': {
            // No modo claro, a navbar é azul escura, então uma borda padrão cinza fica ruim.
            // Deixamos sem borda ou com uma borda bem suave, e focamos no outline de foco.
            borderColor: (t) =>
              t.palette.mode === 'dark' ? 'var(--mui-palette-action2-borderSubtle)' : 'transparent',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          },
          '&:hover fieldset': {
            borderColor: (t) => 
              t.palette.mode === 'dark' ? 'text.secondary' : 'rgba(0, 0, 0, 0.2)',
          },
          '&.Mui-focused fieldset': {
            // Em ambos os modos, usar 'accent.main' (laranja) para o foco garante
            // um contraste perfeito contra o fundo azul escuro da navbar no modo claro!
            borderColor: 'accent.main',
            borderWidth: '2px',
            boxShadow: '0 0 0 3px rgba(251, 146, 60, 0.2)', // glow laranja sutil
          },
          '&:hover': {
            boxShadow: 'var(--app-shadow-md)',
            '& .MuiSvgIcon-root': {
              color: (t) => (t.palette.mode === 'dark' ? 'accent.light' : 'accent.main'),
            }
          },
          '& input': {
            cursor: 'pointer',
            color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'text.primary'),
            fontWeight: 500,
            '&::placeholder': {
              color: 'text.secondary',
              opacity: 1,
            },
          },
        },
        '& .MuiInputAdornment-root': { mr: { xs: 0.25, sm: 1 } },
      }}
    />
  );
}
