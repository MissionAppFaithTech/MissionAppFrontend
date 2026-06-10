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

const heights: Record<LogoSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

function resolveSize(size?: string): LogoSize {
  if (size && size in heights) {
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
  const height = heights[resolvedSize];
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
        }}
      >
        {image}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", lineHeight: 0 }}>
      {image}
    </Box>
  );
}
