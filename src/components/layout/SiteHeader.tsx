"use client";

import { useEffect, useState } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import PillButton from "@/components/common/PillButton";
import PageNavbar from "@/components/layout/PageNavbar";
import { brandColors } from "@/theme/theme";

const navLinks = [
  { label: "Início", href: "/", sectionId: "inicio" },
  { label: "Nossa missão", href: "/#objetivo", sectionId: "objetivo" },
  { label: "Para quem é", href: "/#sobre", sectionId: "sobre" },
  { label: "Como funciona", href: "/#como-funciona", sectionId: "como-funciona" },
];

const navLinkSx = (isActive: boolean) => ({
  position: "relative" as const,
  display: "inline-block",
  py: 0.5,
  textDecoration: "none",
  color: isActive ? brandColors.intermediate : brandColors.missionary,
  fontWeight: isActive ? 600 : 400,
  whiteSpace: "nowrap" as const,
  fontSize: { xs: "0.8125rem", sm: "0.875rem", md: "1rem" },
  transition: "color 0.2s ease",
  "&:hover": { color: brandColors.intermediate },
  "&::after": {
    content: '""',
    position: "absolute",
    left: 0,
    bottom: 0,
    width: isActive ? "100%" : 0,
    height: 2,
    bgcolor: brandColors.intermediate,
    transition: "width 0.2s ease",
  },
  "&:hover::after": {
    width: "100%",
  },
});

export default function SiteHeader() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [activeSection, setActiveSection] = useState("inicio");
  const [scrolled, setScrolled] = useState(false);

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

  return (
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 1.5, sm: 2, md: 4 },
            minWidth: 0,
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
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

        <PillButton href="/select-role" size="small" sx={{ flexShrink: 0 }}>
          Comece agora
        </PillButton>
      </Box>
    </PageNavbar>
  );
}
