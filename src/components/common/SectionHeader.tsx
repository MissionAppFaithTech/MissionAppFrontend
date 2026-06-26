"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  maxWidth?: number;
};

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  maxWidth = 700,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <Stack
      spacing={2}
      sx={{
        textAlign: align,
        maxWidth: isCenter ? maxWidth : undefined,
        mx: isCenter ? "auto" : undefined,
      }}
    >
      <Typography
        variant="overline"
        sx={{
          color: "mission.main",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </Typography>

      <Typography variant="h2">{title}</Typography>

      {subtitle ? (
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  );
}
