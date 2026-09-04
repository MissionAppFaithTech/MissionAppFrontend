'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

const missionarySections = [
  {
    label: 'Sobre',
    mobileLabel: 'Sobre',
    href: '/profile/sobre',
  },
  {
    label: 'Projetos de Impacto',
    mobileLabel: 'Projetos',
    href: '/profile/projetos-de-impacto',
  },
  {
    label: 'Postagens',
    mobileLabel: 'Postagens',
    href: '/profile/postagens',
  },
  {
    label: 'Campanha',
    mobileLabel: 'Campanha',
    href: '/profile/campanha',
  },
] as const;

const supporterSections = [
  { label: 'Seguindo', mobileLabel: 'Seguindo', href: '/profile/supporter/missionarios' },
  { label: 'Salvos', mobileLabel: 'Salvos', href: '/profile/supporter/postagens-salvas' },
] as const;

type ProfileNavigationProps = {
  role?: 'missionary' | 'supporter';
};

export default function ProfileNavigation({ role }: ProfileNavigationProps) {
  const pathname = usePathname();

  const isSupporterRoute = role === 'supporter' || pathname?.startsWith('/profile/supporter');
  const profileSections = isSupporterRoute ? supporterSections : missionarySections;
  const isProfileSectionRoute = profileSections.some(({ href }) => href === pathname);

  if (!isProfileSectionRoute) {
    return null;
  }

  const activePath = pathname;

  if (!activePath) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 3px 8px rgba(13, 43, 92, 0.14)',
        overflow: 'hidden',
      }}
    >
      <Tabs
        value={activePath}
        variant={isSupporterRoute ? 'fullWidth' : 'scrollable'}
        scrollButtons={false}
        aria-label="Seções do perfil"
        sx={{
          minHeight: { xs: 48, sm: 52 },
          '& .MuiTabs-indicator': {
            height: 3,
            bgcolor: 'mission.main',
          },
          '& .MuiTab-root': {
            minHeight: { xs: 48, sm: 52 },
            minWidth: isSupporterRoute ? 0 : { xs: 'max-content', md: 0 },
            px: { xs: 2, sm: 3 },
            color: 'primary.main',
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            fontWeight: 700,
            flex: isSupporterRoute ? 1 : { md: 1 },
            maxWidth: 'none',
          },
          '& .Mui-selected': {
            color: 'mission.main',
          },
        }}
      >
        {profileSections.map(({ label, mobileLabel, href }) => (
          <Tab
            component={Link}
            key={href}
            label={
              <span>
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  {label}
                </Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  {mobileLabel || label}
                </Box>
              </span>
            }
            value={href}
            href={href}
            disableRipple
          />
        ))}
      </Tabs>
    </Paper>
  );
}
