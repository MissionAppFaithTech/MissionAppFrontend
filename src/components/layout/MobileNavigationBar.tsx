'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';

export type UserRole = 'missionary' | 'supporter' | 'visitor';
export type BottomNavViewMode = 'missionary' | 'supporter' | 'visitor';

export interface MobileNavigationBarProps {
  /** Explicitly set authenticated state. If omitted, auto-detects from pathname (/profile) */
  isAuthenticated?: boolean;
  /** Explicitly set logged in state (alias for isAuthenticated) */
  isLoggedIn?: boolean;
  /** Role for custom profile/feed shortcuts */
  role?: UserRole;
  /** Explicitly set view mode: 'missionary' (4 icons), 'supporter' (4 icons), or 'visitor' (3 icons) */
  viewMode?: BottomNavViewMode;
  /** Custom destination for the search/navigation icon */
  searchHref?: string;
  /** Custom label for the search/navigation icon ('Navegar' or 'Pesquisar') */
  searchLabel?: string;
  /** Custom destination for the missionary project icon. Defaults to /profile/projetos-de-impacto */
  projectHref?: string;
  /** Custom label for the missionary project icon. Defaults to 'Projeto' */
  projectLabel?: string;
  /** Target URL for current/selected campaign (supporter view). Defaults to /campanha/campanha-educacao-esperanca */
  campaignHref?: string;
  /** Custom label for the supporter campaign icon. Defaults to 'Campanha' */
  campaignLabel?: string;
  /** Hide navigation bar on edit pages (/edit, /edit-profile). Defaults to true */
  hideOnEditPages?: boolean;
  /** Force display even on edit pages (for testing/demo purposes). Defaults to false */
  forceShow?: boolean;
  /** Additional styling overrides */
  sx?: SxProps<Theme>;
}

export default function MobileNavigationBar({
  isAuthenticated,
  isLoggedIn,
  role = 'visitor',
  viewMode,
  searchHref = '/navegacao',
  searchLabel = 'Navegar',
  projectHref = '/profile/projetos-de-impacto',
  projectLabel = 'Projeto',
  campaignHref = '/campanha/campanha-educacao-esperanca',
  campaignLabel = 'Campanha',
  hideOnEditPages = true,
  forceShow = false,
  sx,
}: MobileNavigationBarProps) {
  const pathname = usePathname();

  // Hide on edit and configuration pages so screens remain completely free ("livre")
  const isFreePage =
    Boolean(pathname?.includes('/edit')) ||
    Boolean(pathname?.endsWith('/edit-profile')) ||
    Boolean(pathname?.includes('/financeiro'));

  if (hideOnEditPages && !forceShow && isFreePage) {
    return null;
  }

  // Resolve authentication status (boolean)
  const isUserLoggedIn =
    isLoggedIn !== undefined
      ? isLoggedIn
      : isAuthenticated !== undefined
        ? isAuthenticated
        : Boolean(pathname?.startsWith('/profile'));

  // Resolve active view mode among the 3 distinct views
  const effectiveViewMode: BottomNavViewMode =
    viewMode ??
    (!isUserLoggedIn
      ? 'visitor'
      : role === 'supporter' || pathname?.startsWith('/profile/supporter')
        ? 'supporter'
        : 'missionary');

  // View 1: Não Registrado (3 minimalistic icons: Explorar, Navegar, Entrar)
  const visitorItems = [
    {
      label: 'Explorar',
      href: '/',
      icon: ExploreOutlinedIcon,
    },
    {
      label: searchLabel,
      href: searchHref,
      icon: SearchOutlinedIcon,
    },
    {
      label: 'Entrar',
      href: '/login',
      icon: LoginOutlinedIcon,
    },
  ];

  // View 2: Missionário (4 icons: Perfil, Navegar, Projeto, Feed)
  const missionaryItems = [
    {
      label: 'Perfil',
      href: '/profile',
      icon: PersonOutlinedIcon,
    },
    {
      label: searchLabel,
      href: searchHref,
      icon: SearchOutlinedIcon,
    },
    {
      label: projectLabel,
      href: projectHref,
      icon: AssignmentOutlinedIcon,
    },
    {
      label: 'Feed',
      href: '/profile/postagens',
      icon: FeedOutlinedIcon,
    },
  ];

  // View 3: Usuário Comum / Apoiador (4 icons: Feed, Navegar, Campanha, Meu Perfil)
  const supporterItems = [
    {
      label: 'Feed',
      href: '/profile/supporter',
      icon: FeedOutlinedIcon,
    },
    {
      label: searchLabel,
      href: searchHref,
      icon: SearchOutlinedIcon,
    },
    {
      label: campaignLabel,
      href: campaignHref,
      icon: CampaignOutlinedIcon,
    },
    {
      label: 'Meu Perfil',
      href: '/profile/supporter/edit-profile',
      icon: PersonOutlinedIcon,
    },
  ];

  const items =
    effectiveViewMode === 'visitor'
      ? visitorItems
      : effectiveViewMode === 'supporter'
        ? supporterItems
        : missionaryItems;

  const ariaLabel =
    effectiveViewMode === 'visitor'
      ? 'Navegação móvel do visitante'
      : effectiveViewMode === 'supporter'
        ? 'Navegação móvel do apoiador'
        : 'Navegação móvel do missionário';

  return (
    <Paper
      elevation={2}
      component="nav"
      aria-label={ariaLabel}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        display: { xs: 'flex', md: 'none' },
        justifyContent: 'space-around',
        alignItems: 'center',
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        pt: 0.75,
        pb: 'calc(env(safe-area-inset-bottom, 0px) + 6px)',
        px: 0.5,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 -2px 12px rgba(0, 0, 0, 0.4)'
            : '0 -2px 10px rgba(13, 43, 92, 0.06)',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        ...sx,
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : item.href.startsWith('/#')
              ? pathname === '/' &&
                typeof window !== 'undefined' &&
                window.location.hash === item.href.replace('/', '')
              : pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

        return (
          <Box
            key={item.label}
            component={Link}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
              minWidth: 48,
              gap: 0.35,
              textDecoration: 'none',
              color: isActive
                ? (theme) => (theme.palette.mode === 'dark' ? 'accent.light' : 'mission.main')
                : 'text.secondary',
              transition: 'color 0.18s ease, transform 0.15s ease',
              py: 0.5,
              px: 0.5,
              borderRadius: 1.5,
              position: 'relative',
              '&:hover': {
                color: (theme) => (theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
              },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'accent.light' : 'primary.main',
                outlineOffset: '-2px',
              },
            }}
          >
            <Icon
              sx={{
                fontSize: 24,
                transition: 'transform 0.15s ease',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
              }}
            />

            <Typography
              variant="caption"
              sx={{
                fontSize: '0.6875rem',
                fontWeight: isActive ? 700 : 500,
                lineHeight: 1,
                letterSpacing: '0.01em',
              }}
            >
              {item.label}
            </Typography>

            {isActive && (
              <Box
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  top: -6,
                  width: 24,
                  height: 3,
                  borderRadius: 1.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'accent.light' : 'mission.main',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 0 8px rgba(251, 146, 60, 0.6)'
                      : '0 1px 4px rgba(230, 81, 0, 0.4)',
                }}
              />
            )}
          </Box>
        );
      })}
    </Paper>
  );
}
