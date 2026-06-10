"use client";

import Button, { type ButtonProps } from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";
import Link from "next/link";

type PillButtonTone = "cta" | "outline" | "ghost";

type PillButtonProps = ButtonProps & {
  href?: string;
  tone?: PillButtonTone;
};

const baseSx = {
  borderRadius: "16px",
  py: 0.5,
  px: 2,
  fontWeight: 500,
  fontSize: "0.9375rem",
  textTransform: "none",
  boxShadow: "none",
  transition:
    "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
};

const hoverLightSx = {
  bgcolor: "common.white",
  color: "primary.main",
  borderColor: "common.white",
  boxShadow: "none",
};

const toneSx: Record<PillButtonTone, SxProps<Theme>> = {
  cta: {
    border: "2px solid",
    borderColor: "mission.dark",
    bgcolor: "mission.main",
    color: "mission.contrastText",
    "&:hover": hoverLightSx,
  },
  outline: {
    bgcolor: "transparent",
    border: "2px solid",
    borderColor: "primary.main",
    color: "primary.main",
    "&:hover": {
      ...hoverLightSx,
      borderColor: "primary.main",
    },
  },
  ghost: {
    bgcolor: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    borderColor: "rgba(255, 255, 255, 0.25)",
    color: "white",
    "&:hover": hoverLightSx,
  },
};

export default function PillButton({
  href,
  tone = "cta",
  sx,
  ...props
}: PillButtonProps) {
  const pillSx = [baseSx, toneSx[tone], sx] as SxProps<Theme>;

  if (href) {
    return <Button component={Link} href={href} sx={pillSx} {...props} />;
  }

  return <Button sx={pillSx} {...props} />;
}
