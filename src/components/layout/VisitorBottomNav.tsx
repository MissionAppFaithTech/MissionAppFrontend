'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';

const navItems = [
  { label: 'Explorar', href: '/', icon: ExploreOutlinedIcon },
  { label: 'Buscar', href: '/#buscar', icon: SearchOutlinedIcon },
  { label: 'Campanhas', href: '/#campanhas', icon: VolunteerActivismOutlinedIcon },
  { label: 'Entrar', href: '/login', icon: LoginOutlinedIcon },
];

export default function VisitorBottomNav() {
  const pathname = usePathname();

  return (
    <Paper
      elevation={4}
      component="nav"
      aria-label="Navegação inferior do visitante"
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
        px: 1,
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

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
              gap: 0.25,
              textDecoration: 'none',
              color: isActive ? 'mission.main' : 'text.secondary',
              transition: 'color 0.15s ease, transform 0.15s ease',
              py: 0.5,
              borderRadius: 1.5,
              position: 'relative',
              '&:hover': {
                color: 'mission.main',
              },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '-2px',
              },
            }}
          >
            <Icon sx={{ fontSize: 24 }} />
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.6875rem',
                fontWeight: isActive ? 700 : 500,
                lineHeight: 1,
              }}
            >
              {item.label}
            </Typography>
            {isActive && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -6,
                  width: 20,
                  height: 3,
                  borderRadius: 1.5,
                  bgcolor: 'mission.main',
                }}
              />
            )}
          </Box>
        );
      })}
    </Paper>
  );
}
