"use client";

import { useEffect, useState } from "react";
import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import PillButton from "@/components/common/PillButton";
import PageNavbar, { PageNavbarActions } from "@/components/layout/PageNavbar";

const navLinks = [
  { label: "Início", href: "/", sectionId: "inicio" },
  { label: "Nossa missão", href: "/#objetivo", sectionId: "objetivo" },
  { label: "Para quem é", href: "/#sobre", sectionId: "sobre" },
  { label: "Como funciona", href: "/#como-funciona", sectionId: "como-funciona" },
];

export default function SiteHeader() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeSection, setActiveSection] = useState("inicio");

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
    <PageNavbar>
      <Logo size="lg" onDark />

      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          gap: 2,
          ml: 8,
          flex: 1,
        }}
      >
        {navLinks.map(({ label, href, sectionId }) => {
          const isActive = activeSection === sectionId;

          return (
            <Typography
              key={href}
              variant="body1"
              component={Link}
              href={href}
              sx={{
                position: "relative",
                display: "inline-block",
                py: 0.5,
                textDecoration: "none",
                color: isActive ? "supporter.light" : "inherit",
                transition: "color 0.2s ease",
                "&:hover": { color: "supporter.light" },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  width: isActive ? "100%" : 0,
                  height: 2,
                  bgcolor: "supporter.light",
                  transition: "width 0.2s ease",
                },
                "&:hover::after": {
                  width: "100%",
                },
              }}
            >
              {label}
            </Typography>
          );
        })}
      </Box>

      <Box sx={{ flex: 1, display: { xs: "block", md: "none" } }} />

      <PageNavbarActions>
        <PillButton href="/select-role" size="small" tone="ghost">
          Entrar
        </PillButton>

        <IconButton
          edge="end"
          aria-label="Abrir menu"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ display: { md: "none" }, color: "inherit" }}
        >
          <MenuIcon />
        </IconButton>
      </PageNavbarActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {navLinks.map(({ label, href }) => (
          <MenuItem
            key={href}
            component={Link}
            href={href}
            onClick={() => setAnchorEl(null)}
          >
            {label}
          </MenuItem>
        ))}
        <MenuItem
          component={Link}
          href="/select-role"
          onClick={() => setAnchorEl(null)}
        >
          Entrar
        </MenuItem>
      </Menu>
    </PageNavbar>
  );
}
