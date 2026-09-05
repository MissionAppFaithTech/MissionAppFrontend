'use client';

import Logo from '@/components/common/Logo';
import PillButton from '@/components/common/PillButton';
import ThemeToggle from '@/components/ThemeToggle';
import PageNavbar, { PageNavbarActions } from '@/components/layout/PageNavbar';

type VisitorNavbarProps = {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  onSearchClick?: () => void;
};

export default function VisitorNavbar({ maxWidth = 'lg' }: VisitorNavbarProps) {
  return (
    <PageNavbar maxWidth={maxWidth}>
      <Logo size="sm" href="/" variant="dark" />

      <PageNavbarActions>
        <ThemeToggle />

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
