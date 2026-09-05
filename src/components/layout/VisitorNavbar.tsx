'use client';

import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Logo from '@/components/common/Logo';
import PillButton from '@/components/common/PillButton';
import PageNavbar, { PageNavbarActions } from '@/components/layout/PageNavbar';

type VisitorNavbarProps = {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  onSearchClick?: () => void;
};

export default function VisitorNavbar({ maxWidth = 'lg', onSearchClick }: VisitorNavbarProps) {
  return (
    <PageNavbar maxWidth={maxWidth}>
      <Logo size="lg" href="/" variant="dark" />

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
        <TextField
          placeholder="Pesquisar missionário"
          size="small"
          aria-label="Pesquisar missionário"
          onClick={onSearchClick}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                </InputAdornment>
              ),
            },
            htmlInput: { readOnly: true },
          }}
          sx={{
            width: '100%',
            maxWidth: { xs: 150, sm: 240, md: 320 },
            '& .MuiOutlinedInput-root': {
              height: { xs: 34, sm: 36 },
              bgcolor: 'background.paper',
              borderRadius: 2,
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              px: { xs: 0.5, sm: 1 },
            },
            '& .MuiInputAdornment-root': { mr: { xs: 0.25, sm: 1 } },
          }}
        />
      </Box>

      <PageNavbarActions>
        <PillButton
          href="/login"
          tone="ghost"
          size="small"
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.4, sm: 0.6 },
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            fontWeight: 600,
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            bgcolor: 'rgba(255, 255, 255, 0.12)',
            color: 'common.white',
            '&:hover': {
              bgcolor: 'common.white',
              color: 'primary.main',
              borderColor: 'common.white',
            },
          }}
        >
          Entrar
        </PillButton>

        <PillButton
          href="/select-role"
          tone="missionFlat"
          size="small"
          sx={{
            display: { xs: 'none', sm: 'inline-flex' },
            px: 2,
            py: 0.6,
            fontSize: '0.875rem',
            fontWeight: 600,
            borderRadius: '14px',
          }}
        >
          Cadastre-se
        </PillButton>
      </PageNavbarActions>
    </PageNavbar>
  );
}
