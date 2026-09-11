'use client';

import { useRouter } from 'next/navigation';
import type { KeyboardEvent } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
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

  const handleNavigate = () => {
    router.push(href);
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
              <SearchIcon
                sx={{
                  fontSize: 18,
                  color: (t) => (t.palette.mode === 'dark' ? 'text.primary' : 'primary.main'),
                }}
              />
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
        '& .MuiOutlinedInput-root': {
          cursor: 'pointer',
          height: { xs: 34, sm: 36 },
          bgcolor: (t) =>
            t.palette.mode === 'dark' ? 'var(--mui-palette-action2-fieldBg)' : 'background.paper',
          borderRadius: 2,
          fontSize: { xs: '0.7rem', sm: '0.8rem' },
          px: { xs: 0.5, sm: 1 },
          border: (t) =>
            t.palette.mode === 'dark'
              ? '1px solid var(--mui-palette-action2-borderSubtle)'
              : 'none',
          '&:hover': {
            borderColor: (t) => (t.palette.mode === 'dark' ? 'text.secondary' : undefined),
          },
          '& input': {
            cursor: 'pointer',
            color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'text.primary'),
            '&::placeholder': {
              color: (t) => (t.palette.mode === 'dark' ? 'text.secondary' : 'text.secondary'),
              opacity: 1,
            },
          },
        },
        '& .MuiInputAdornment-root': { mr: { xs: 0.25, sm: 1 } },
      }}
    />
  );
}
