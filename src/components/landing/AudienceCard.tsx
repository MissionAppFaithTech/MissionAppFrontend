"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

type AudienceCardProps = {
  label: string;
  title: string;
  benefits: readonly string[];
  accentColor: "primary.main" | "supporter.main" | "connection.main";
  mockupVariant: "missionary" | "supporter";
};

function PhoneMockup({ variant }: { variant: "missionary" | "supporter" }) {
  const isMissionary = variant === "missionary";

  return (
    <Box
      sx={{
        mx: "auto",
        width: "100%",
        maxWidth: 200,
        mb: 3,
      }}
    >
      <Box
        sx={{
          borderRadius: 4,
          border: "3px solid",
          borderColor: isMissionary ? "primary.main" : "supporter.main",
          bgcolor: isMissionary ? "primary.dark" : "supporter.dark",
          p: 1.5,
          aspectRatio: "9/16",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box sx={{ height: 8, width: "40%", borderRadius: 999, bgcolor: "rgba(255,255,255,0.35)", mx: "auto" }} />
        <Box sx={{ flex: 1, borderRadius: 2, bgcolor: "rgba(255,255,255,0.12)" }} />
        <Box sx={{ height: 10, width: "70%", borderRadius: 999, bgcolor: "rgba(255,255,255,0.25)" }} />
        <Box sx={{ height: 10, width: "55%", borderRadius: 999, bgcolor: "rgba(255,255,255,0.18)" }} />
      </Box>
    </Box>
  );
}

export default function AudienceCard({
  label,
  title,
  benefits,
  accentColor,
  mockupVariant,
}: AudienceCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        height: "100%",
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          borderColor: accentColor,
          boxShadow: "0 12px 40px rgba(13, 43, 92, 0.08)",
        },
      }}
    >
      <PhoneMockup variant={mockupVariant} />

      <Typography
        variant="overline"
        sx={{ color: accentColor, fontWeight: 700, letterSpacing: "0.1em" }}
      >
        {label}
      </Typography>

      <Typography variant="h5" sx={{ mt: 1, mb: 2.5 }}>
        {title}
      </Typography>

      <Stack spacing={1.5}>
        {benefits.map((benefit) => (
          <Stack key={benefit} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
            <FavoriteBorderIcon sx={{ fontSize: 20, color: accentColor, mt: 0.25 }} />
            <Typography variant="body2" color="text.secondary">
              {benefit}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
