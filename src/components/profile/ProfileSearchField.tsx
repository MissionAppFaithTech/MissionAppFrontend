'use client';

import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';

type ProfileSearchFieldProps = {
  placeholder?: string;
  maxWidth?: { xs: number; sm: number; md: number };
};

export default function ProfileSearchField({
  placeholder = 'Pesquisar missionário',
  maxWidth = { xs: 150, sm: 240, md: 280 },
}: ProfileSearchFieldProps) {
  return (
    <TextField
      placeholder={placeholder}
      size="small"
      aria-label={placeholder}
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
        htmlInput: { readOnly: true },
      }}
      sx={{
        width: '100%',
        maxWidth,
        '& .MuiOutlinedInput-root': {
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
