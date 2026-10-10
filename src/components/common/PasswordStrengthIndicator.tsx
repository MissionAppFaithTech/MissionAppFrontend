'use client';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { colors } from '@/theme/theme';
import { getPasswordStrength, passwordRequirements } from '@/lib/passwordStrength';

const strengthColor = {
  inherit: colors.textSecondary,
  error: colors.error,
  warning: colors.warning,
  success: colors.success,
} as const;

type PasswordStrengthIndicatorProps = {
  password: string;
};

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = getPasswordStrength(password);
  const showMeter = strength.level !== 'empty';

  return (
    <Box
      component="section"
      aria-label="Requisitos da senha"
      sx={{ mt: -0.5, minWidth: 0 }}
    >
      {showMeter ? (
        <>
          <LinearProgress
            variant="determinate"
            value={strength.score}
            aria-hidden
            sx={{
              height: 4,
              borderRadius: 1,
              mb: 0.5,
              bgcolor: colors.border,
              '& .MuiLinearProgress-bar': {
                bgcolor: strengthColor[strength.color],
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{ display: 'block', mb: 0.5, color: strengthColor[strength.color] }}
          >
            {strength.label}
          </Typography>
        </>
      ) : null}

      <Box
        component="ul"
        sx={{
          m: 0,
          pl: 0,
          listStyle: 'none',
          display: 'grid',
          gap: 0.25,
          minWidth: 0,
        }}
      >
        {passwordRequirements.map((rule) => {
          const met = rule.test(password);
          return (
            <Box
              key={rule.id}
              component="li"
              aria-label={`${rule.label}: ${met ? 'atendido' : 'faltando'}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                minWidth: 0,
                color: met ? colors.success : colors.textSecondary,
              }}
            >
              {met ? (
                <CheckIcon aria-hidden fontSize="inherit" sx={{ fontSize: 14, flexShrink: 0 }} />
              ) : (
                <CloseIcon aria-hidden fontSize="inherit" sx={{ fontSize: 14, flexShrink: 0 }} />
              )}
              <Typography
                variant="caption"
                component="span"
                sx={{ fontSize: '0.75rem', lineHeight: 1.3, minWidth: 0 }}
              >
                {rule.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
