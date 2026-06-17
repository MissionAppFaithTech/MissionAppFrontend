"use client";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { getPasswordStrength } from "@/lib/passwordStrength";

type PasswordStrengthIndicatorProps = {
  password: string;
};

export default function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const strength = getPasswordStrength(password);

  if (strength.level === "empty") return null;

  return (
    <Box sx={{ mt: -1 }}>
      <LinearProgress
        variant="determinate"
        value={strength.score}
        color={strength.color === "inherit" ? "primary" : strength.color}
        sx={{ height: 6, borderRadius: 999 }}
      />
      <Typography
        variant="caption"
        sx={{ mt: 0.5, display: "block", color: `${strength.color}.main` }}
      >
        {strength.label}
      </Typography>
    </Box>
  );
}
