"use client";

import Button, { type ButtonProps } from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";
import Link from "next/link";

type PillButtonTone =
  | "cta"
  | "mission"
  | "missionFlat"
  | "missionOutline"
  | "primaryOutline"
  | "outline"
  | "ghost";

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
    borderColor: "primary.dark",
    bgcolor: "primary.main",
    color: "primary.contrastText",
    "&:hover": {
      bgcolor: "connection.main",
      borderColor: "connection.main",
      color: "common.white",
      boxShadow: "none",
    },
  },
  mission: {
    border: "2px solid",
    borderColor: "mission.dark",
    bgcolor: "mission.main",
    color: "mission.contrastText",
    "&:hover": {
      bgcolor: "connection.main",
      borderColor: "connection.main",
      color: "common.white",
      boxShadow: "none",
    },
  },
  missionFlat: {
    border: "2px solid",
    borderColor: "mission.dark",
    borderRadius: "6px",
    bgcolor: "mission.main",
    color: "mission.contrastText",
    "&:hover": {
      bgcolor: "connection.main",
      borderColor: "connection.main",
      color: "common.white",
      boxShadow: "none",
    },
  },
  missionOutline: {
    border: "2px solid",
    borderColor: "mission.main",
    borderRadius: "6px",
    bgcolor: "transparent",
    color: "mission.main",
    "&:hover": {
      bgcolor: "mission.main",
      borderColor: "mission.dark",
      color: "mission.contrastText",
      boxShadow: "none",
    },
  },
  primaryOutline: {
    border: "2px solid",
    borderColor: "primary.main",
    borderRadius: "6px",
    bgcolor: "transparent",
    color: "primary.main",
    "&:hover": {
      bgcolor: "primary.main",
      borderColor: "primary.dark",
      color: "primary.contrastText",
      boxShadow: "none",
    },
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
