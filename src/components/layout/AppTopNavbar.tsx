'use client';

import Box from '@mui/material/Box';
import Logo from '@/components/common/Logo';
import PillButton from '@/components/common/PillButton';
import ThemeToggle from '@/components/ThemeToggle';
import PageNavbar, { PageNavbarActions } from '@/components/layout/PageNavbar';
import LoginIcon from '@mui/icons-material/Login';
import ProfileSearchField from '@/components/profile/ProfileSearchField';
import ProfileAccountMenu from '@/components/profile/ProfileAccountMenu';
import { mockProfile, mockSupporterProfile } from '@/mocks/profile';
import type { ProfileData } from '@/types/profile';
import AccessibilityPreferencesButton from '@/components/a11y/AccessibilityPreferences';

export interface AppTopNavbarProps {
  /** Boolean flag separating logged in user view and non-registered visitor view */
  isLoggedIn?: boolean;
  /** Role to pick default profile mock when logged in ('missionary' | 'supporter') */
  role?: 'missionary' | 'supporter' | 'visitor';
  /** Custom profile data for the account menu */
  profile?: Pick<ProfileData, 'username' | 'displayName'>;
  /** Max width container */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  /** Custom search placeholder */
  searchPlaceholder?: string;
}

export default function AppTopNavbar({
  isLoggedIn = false,
  role = 'visitor',
  profile,
  maxWidth = 'lg',
  searchPlaceholder = 'Buscar missionários, projetos ou campanhas...',
}: AppTopNavbarProps) {
  // Resolve user profile for the account menu when logged in
  const resolvedProfile =
    profile ??
    (role === 'supporter'
      ? { username: mockSupporterProfile.username, displayName: mockSupporterProfile.displayName }
      : { username: mockProfile.username, displayName: mockProfile.displayName });

  return (
    <PageNavbar maxWidth={maxWidth}>
      <Logo size="sm" variant="dark" />

      {/* When logged in: Central quick search field (RF 7.1) - hidden on mobile (xs/sm), visible on desktop (md+) */}
      {isLoggedIn && (
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'center',
            px: { sm: 2, md: 3 },
          }}
        >
          <ProfileSearchField
            placeholder={searchPlaceholder}
            maxWidth={{ xs: 150, sm: 260, md: 340 }}
          />
        </Box>
      )}

      <PageNavbarActions>
        <AccessibilityPreferencesButton />
        <ThemeToggle />

        {/* When not registered: Action buttons 'Entrar' and 'Cadastre-se' */}
        {!isLoggedIn ? (
          <>
            <PillButton
              href="/login"
              tone="ghost"
              size="small"
              startIcon={<LoginIcon aria-hidden />}
              sx={{
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.4, sm: 0.6 },
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                fontWeight: 700,
                // NOTE: solid white on the navy bar (≥12:1 label, clear edge) instead of a faint wash
                // `&&` beats the dark-scheme color of MUI text buttons (light blue on white)
                '&&': {
                  border: '2px solid',
                  borderColor: 'common.white',
                  bgcolor: 'common.white',
                  color: 'common.black',
                },
                '& .MuiButton-startIcon': { mr: 0.5 },
                '&&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.85)',
                  color: 'common.black',
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
              }}
            >
              Cadastre-se
            </PillButton>
          </>
        ) : (
          /* When logged in: Profile account menu / avatar */
          <ProfileAccountMenu profile={resolvedProfile} role={role} />
        )}
      </PageNavbarActions>
    </PageNavbar>
  );
}
