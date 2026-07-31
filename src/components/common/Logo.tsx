"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

const LOGO_PATHS = {
  light: "/logos/logo_light.PNG",
  dark: "/logos/logo_dark.PNG",
} as const;

type LogoSize = "sm" | "md" | "lg" | "xl";
type LogoVariant = "auto" | "light" | "dark";

type LogoProps = {
  href?: string;
  size?: LogoSize;
  /** `auto` follows light/dark theme. Use `dark` on gradient navbar. */
  variant?: LogoVariant;
  /** @deprecated Prefer `variant="dark"` */
  onDark?: boolean;
};

/** Altura visual + largura máxima — logo empilhada precisa de largura na navbar. */
const sizes: Record<LogoSize, { height: number; maxWidth: number }> = {
  sm: { height: 36, maxWidth: 112 },
  md: { height: 44, maxWidth: 140 },
  lg: { height: 52, maxWidth: 168 },
  xl: { height: 80, maxWidth: 240 },
};

function resolveSize(size?: string): LogoSize {
  if (size && size in sizes) {
    return size as LogoSize;
  }
  return "md";
}

function resolveVariant(variant: LogoVariant, onDark: boolean): LogoVariant {
  if (onDark) return "dark";
  return variant;
}

export default function Logo({
  href = "/",
  size,
  variant = "auto",
  onDark = false,
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const resolvedSize = resolveSize(size);
  const { height, maxWidth } = sizes[resolvedSize];
  const logoVariant = resolveVariant(variant, onDark);

  useEffect(() => {
    setMounted(true);
  }, []);

  const useDarkLogo =
    logoVariant === "dark" ||
    (logoVariant === "auto" && mounted && resolvedTheme === "dark");

  const src = useDarkLogo ? LOGO_PATHS.dark : LOGO_PATHS.light;

  const image = (
    <Image
      src={src}
      alt="Mission App"
      width={280}
      height={280}
      priority={resolvedSize !== "sm"}
      style={{
        height,
        width: "auto",
        maxWidth,
        objectFit: "contain",
        display: "block",
      }}
    />
  );

  if (href) {
    return (
      <Box
        component={Link}
        href={href}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          textDecoration: "none",
          lineHeight: 0,
          flexShrink: 0,
        }}
      >
        {image}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 0,
        flexShrink: 0,
      }}
    >
      {image}
    </Box>
  );
}
