"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import PillButton from "@/components/common/PillButton";
import PageNavbar from "@/components/layout/PageNavbar";
import { roleColors } from "@/theme/theme";

const navLinks = [
  { label: "Início", href: "/", sectionId: "inicio" },
  { label: "Propósito", href: "/#objetivo", sectionId: "objetivo" },
  { label: "Comunidade", href: "/#sobre", sectionId: "sobre" },
  { label: "Como funciona", href: "/#como-funciona", sectionId: "como-funciona" },
  { label: "Perguntas frequentes", href: "/#faq", sectionId: "faq" },
];

const navLinkSx = (isActive: boolean) => ({
  position: "relative" as const,
  display: "inline-block",
  py: 0.5,
  textDecoration: "none",
  color: isActive ? roleColors.intermediate : roleColors.missionary,
  fontWeight: isActive ? 600 : 400,
  whiteSpace: "nowrap" as const,
  fontSize: { xs: "0.8125rem", sm: "0.875rem", md: "1rem" },
  transition: "color 0.2s ease",
  "&:hover": { color: roleColors.intermediate },
  "&::after": {
    content: '""',
    position: "absolute",
    left: 0,
    bottom: 0,
    width: isActive ? "100%" : 0,
    height: 2,
    bgcolor: roleColors.intermediate,
    transition: "width 0.2s ease",
  },
  "&:hover::after": {
    width: "100%",
  },
});

const mobileNavLinkSx = (isActive: boolean) => ({
  display: "block",
  py: 1.5,
  textDecoration: "none",
  color: isActive ? roleColors.intermediate : roleColors.missionary,
  fontWeight: isActive ? 600 : 500,
  fontSize: "1.125rem",
  borderBottom: "1px solid",
  borderColor: "divider",
  transition: "color 0.2s ease",
  "&:hover": { color: roleColors.intermediate },
});

export default function SiteHeader() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [activeSection, setActiveSection] = useState("inicio");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5] }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <>
      <PageNavbar variant="landing" scrolled={scrolled}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2, md: 3 },
          }}
        >
          <Logo size={isDesktop ? "lg" : "sm"} variant="light" />

          <Box
            component="nav"
            aria-label="Navegação principal"
            sx={{
              flex: 1,
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              minWidth: 0,
            }}
          >
            {navLinks.map(({ label, href, sectionId }) => (
              <Typography
                key={href}
                variant="body1"
                component={Link}
                href={href}
                sx={navLinkSx(activeSection === sectionId)}
              >
                {label}
              </Typography>
            ))}
          </Box>

          <PillButton
            href="/select-role"
            size="small"
            sx={{ flexShrink: 0, display: { xs: "none", md: "inline-flex" } }}
          >
            Entrar
          </PillButton>

          <IconButton
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMobileOpen((open) => !open)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              ml: "auto",
              color: roleColors.missionary,
            }}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      </PageNavbar>

      <Drawer
        anchor="right"
        open={mobileOpen && !isDesktop}
        onClose={closeMobileMenu}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { md: "none" },
          "& .MuiDrawer-paper": {
            width: "min(100vw, 320px)",
            px: 2.5,
            py: 2,
            bgcolor: "background.default",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <IconButton
            aria-label="Fechar menu"
            onClick={closeMobileMenu}
            sx={{ color: roleColors.missionary }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack
          component="nav"
          aria-label="Navegação mobile"
          spacing={0}
          sx={{ flex: 1 }}
        >
          {navLinks.map(({ label, href, sectionId }) => (
            <Typography
              key={href}
              component={Link}
              href={href}
              onClick={closeMobileMenu}
              sx={mobileNavLinkSx(activeSection === sectionId)}
            >
              {label}
            </Typography>
          ))}
        </Stack>

        <PillButton href="/select-role" fullWidth sx={{ mt: 3 }} onClick={closeMobileMenu}>
          Entrar
        </PillButton>
      </Drawer>
    </>
  );
}
