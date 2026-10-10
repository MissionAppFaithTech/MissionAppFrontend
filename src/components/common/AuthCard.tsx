'use client';

import Card, { type CardProps } from '@mui/material/Card';
import { colors, lightTokens, roleColors } from '@/theme/theme';

type AuthCardProps = CardProps & {
  /** Footer / secondary card — lighter shadow. */
  muted?: boolean;
};

/**
 * White auth card. Stays a light surface in dark mode so form contrast
 * does not collapse against the navy page.
 */
export default function AuthCard({ muted = false, sx, children, ...props }: AuthCardProps) {
  return (
    <Card
      elevation={0}
      data-auth-card=""
      sx={[
        {
          borderRadius: 3,
          border: '1px solid',
          borderColor: lightTokens.borderSubtle,
          bgcolor: colors.surface,
          color: lightTokens.textPrimary,
          colorScheme: 'light',
          boxShadow: muted
            ? '0 2px 8px rgba(13, 43, 92, 0.08)'
            : '0 4px 16px rgba(13, 43, 92, 0.12)',
          '--mui-palette-text-primary': lightTokens.textPrimary,
          '--mui-palette-text-secondary': lightTokens.textSecondary,
          '--mui-palette-text-disabled': lightTokens.textDisabled,
          '--auth-placeholder-color': lightTokens.textDisabled,
          '--mui-palette-action-disabled': lightTokens.textDisabled,
          '--mui-palette-action-disabledBackground': lightTokens.disabledFill,
          '--mui-palette-primary-main': colors.primary,
          '--mui-palette-primary-light': colors.primary,
          '--mui-palette-primary-dark': colors.textPrimary,
          '--mui-palette-primary-contrastText': colors.surface,
          '--mui-palette-connection-main': roleColors.intermediate,
          '--mui-palette-mission-main': roleColors.mission,
          '--mui-palette-mission-dark': roleColors.mission,
          '--mui-palette-mission-contrastText': colors.surface,
          '--mui-palette-action2-fieldBg': lightTokens.fieldBg,
          '--mui-palette-action2-fieldBgDisabled': lightTokens.fieldBgDisabled,
          '--mui-palette-action2-borderSubtle': lightTokens.borderSubtle,
          '--mui-palette-action2-borderStrong': lightTokens.borderStrong,
          '--mui-palette-action2-secondaryHoverWash': lightTokens.secondaryHoverWash,
          '--mui-palette-action2-fill': lightTokens.actionFill,
          '--mui-palette-action2-fillHover': lightTokens.actionFillHover,
          '--mui-palette-action2-fillText': lightTokens.actionFillText,
          '--mui-palette-action2-focusRing': lightTokens.focusRing,
          '--mui-palette-divider': lightTokens.borderSubtle,
          '--mui-palette-action-active': lightTokens.textSecondary,
          '--mui-palette-success-main': colors.success,
          '--mui-palette-success-dark': colors.success,
          '--mui-palette-error-main': colors.error,
          '--mui-palette-error-dark': colors.error,
          '--mui-palette-warning-main': colors.warning,
          '--mui-palette-warning-dark': colors.warning,
          '--mui-palette-action2-danger': lightTokens.danger,
          '--mui-palette-action2-disabledFill': lightTokens.disabledFill,
          '--mui-palette-action2-disabledBorder': lightTokens.disabledBorder,
          '--mui-palette-action2-disabledText': lightTokens.disabledText,
          '& .MuiOutlinedInput-root': {
            backgroundColor: `${lightTokens.fieldBg} !important`,
            color: lightTokens.textPrimary,
            minHeight: 48,
          },
          '& .MuiOutlinedInput-input': {
            color: `${lightTokens.textPrimary} !important`,
            caretColor: lightTokens.textPrimary,
            py: 1.25,
            '&::placeholder': {
              color: `${lightTokens.textDisabled} !important`,
              opacity: 1,
              WebkitTextFillColor: `${lightTokens.textDisabled} !important`,
            },
          },
          '& .MuiInputAdornment-root, & .MuiIconButton-root': {
            color: lightTokens.textSecondary,
          },
          '& .MuiIconButton-root:hover': {
            color: colors.primary,
            backgroundColor: lightTokens.secondaryHoverWash,
          },
          '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active':
            {
              WebkitBoxShadow: `0 0 0 1000px ${lightTokens.fieldBg} inset !important`,
              boxShadow: `0 0 0 1000px ${lightTokens.fieldBg} inset !important`,
              WebkitTextFillColor: `${lightTokens.textPrimary} !important`,
              caretColor: `${lightTokens.textPrimary} !important`,
            },
        },
        ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </Card>
  );
}
