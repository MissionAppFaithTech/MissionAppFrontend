'use client';

import { useEffect, useState } from 'react';
import { Box, Drawer, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/common/Logo';
import PillButton from '@/components/common/PillButton';
import PageNavbar from '@/components/layout/PageNavbar';

const navLinks = [
  { label: 'Início', href: '/', sectionId: 'inicio' },
  { label: 'Propósito', href: '/#objetivo', sectionId: 'objetivo' },
  { label: 'Comunidade', href: '/#sobre', sectionId: 'sobre' },
  { label: 'Como funciona', href: '/#como-funciona', sectionId: 'como-funciona' },
  { label: 'Perguntas frequentes', href: '/#faq', sectionId: 'faq' },
];

const navLinkSx = (isActive: boolean) => ({
  position: 'relative' as const,
  display: 'inline-block',
  py: 0.5,
  textDecoration: 'none',
  color: isActive ? 'var(--app-nav-active)' : 'text.primary',
  fontWeight: isActive ? 700 : 500,
  whiteSpace: 'nowrap' as const,
  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.95rem' },
  transition: 'color 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    color: 'var(--app-nav-active)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: isActive ? '100%' : 0,
    height: 2,
    bgcolor: 'var(--app-nav-active)',
    transition: 'width 0.2s ease',
  },
  '&:hover::after': {
    width: '100%',
  },
});

const mobileNavLinkSx = (isActive: boolean) => ({
  display: 'block',
  py: 1.5,
  textDecoration: 'none',
  color: isActive ? 'var(--app-nav-active)' : 'text.primary',
  fontWeight: isActive ? 700 : 500,
  fontSize: '1.05rem',
  borderBottom: '1px solid',
  borderColor: 'divider',
  transition: 'color 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    color: 'var(--app-nav-active)',
  },
});

export default function SiteHeader() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [activeSection, setActiveSection] = useState('inicio');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sectionIds = navLinks.map(({ sectionId }) => sectionId);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const closeMobileMenu = () => setMobileOpen(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#') || href.startsWith('#')) {
      const id = href.replace('/#', '').replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${id}`);
        closeMobileMenu();
      }
    } else if (href === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
      closeMobileMenu();
    }
  };

  return (
    <>
      <PageNavbar variant="landing" scrolled={scrolled}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2, md: 3 },
          }}
        >
          <Logo size={isDesktop ? 'lg' : 'md'} variant="auto" />

          <Box
            component="nav"
            aria-label="Navegação principal"
            sx={{
              flex: 1,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              gap: { md: 2.5, lg: 4 },
              minWidth: 0,
            }}
          >
            {navLinks.map(({ label, href, sectionId }) => (
              <Typography
                key={href}
                variant="body1"
                component={Link}
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                sx={navLinkSx(activeSection === sectionId)}
              >
                {label}
              </Typography>
            ))}
          </Box>

          <Box
            sx={{
              ml: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            <ThemeToggle />

            <PillButton
              href="/login"
              size="small"
              tone="primaryOutline"
              sx={{
                flexShrink: 0,
                // 44px on phones per AGENTS.md; the desktop header stays compact.
                minHeight: { xs: 44, sm: 38 },
                px: { xs: 1.5, sm: 2.25 },
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                fontWeight: 600,
                borderWidth: '1.5px',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'text.secondary' : 'primary.main',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'var(--mui-palette-action2-secondaryHoverWash)'
                    : 'transparent',
                color: (theme) => (theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark' ? 'var(--app-shadow-xs)' : 'none',
                '&:hover': {
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'common.white' : 'primary.dark',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'var(--mui-palette-action2-borderSubtle)'
                      : 'rgba(13, 43, 92, 0.08)',
                },
              }}
            >
              Entrar
            </PillButton>

            <PillButton
              href="/select-role"
              size="small"
              tone="missionFilled"
              sx={{
                flexShrink: 0,
                display: { xs: 'none', sm: 'inline-flex' },
                minHeight: 38,
                px: { sm: 1.75, md: 2.25 },
                fontSize: '0.875rem',
                fontWeight: 700,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'accent.main' : 'mission.main',
                color: 'mission.contrastText',
                boxShadow: '0 2px 8px rgba(230, 81, 0, 0.35)',
                '&:hover': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'mission.main' : 'mission.dark',
                  boxShadow: '0 4px 12px rgba(230, 81, 0, 0.45)',
                },
              }}
            >
              Cadastre-se
            </PillButton>

            <IconButton
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setMobileOpen((open) => !open)}
              sx={{
                display: { xs: 'inline-flex', md: 'none' },
                color: 'text.primary',
                minWidth: 44,
                minHeight: 44,
              }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Box>
        </Box>
      </PageNavbar>

      <Drawer
        anchor="right"
        open={mobileOpen && !isDesktop}
        onClose={closeMobileMenu}
        aria-label="Menu de navegação móvel"
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { md: 'none' },
          '& .MuiDrawer-paper': {
            width: 'min(100vw, 320px)',
            px: 2.5,
            py: 2.5,
            bgcolor: 'background.paper',
            color: 'text.primary',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Logo size="sm" variant="auto" />
          <IconButton
            aria-label="Fechar menu"
            onClick={closeMobileMenu}
            sx={{ color: 'text.primary', minWidth: 44, minHeight: 44 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack component="nav" aria-label="Navegação mobile" spacing={0} sx={{ flex: 1 }}>
          {navLinks.map(({ label, href, sectionId }) => (
            <Typography
              key={href}
              component={Link}
              href={href}
              onClick={(e) => handleNavClick(e, href)}
              sx={mobileNavLinkSx(activeSection === sectionId)}
            >
              {label}
            </Typography>
          ))}
        </Stack>

        <Stack spacing={1.5} sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <PillButton
            href="/select-role"
            tone="missionFilled"
            fullWidth
            onClick={closeMobileMenu}
            sx={{
              minHeight: 44,
              fontSize: '0.95rem',
              fontWeight: 700,
              bgcolor: 'accent.main',
              color: 'mission.contrastText',
              '&:hover': { bgcolor: 'accent.dark' },
            }}
          >
            Cadastre-se
          </PillButton>

          <PillButton
            href="/login"
            tone="primaryOutline"
            fullWidth
            onClick={closeMobileMenu}
            sx={{
              minHeight: 44,
              fontSize: '0.95rem',
              fontWeight: 600,
            }}
          >
            Entrar
          </PillButton>
        </Stack>
      </Drawer>
    </>
  );
}
