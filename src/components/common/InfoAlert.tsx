'use client';

import type { ReactNode } from 'react';
import Alert, { type AlertProps } from '@mui/material/Alert';

type InfoAlertProps = Omit<AlertProps, 'severity' | 'children'> & {
  children: ReactNode;
};

const infoAlertSx = {
  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
  alignItems: 'center',
  color: 'info.dark',
  bgcolor:
    'color-mix(in srgb, var(--mui-palette-info-main) 16%, var(--mui-palette-background-paper))',
  border: '1px solid',
  borderColor:
    'color-mix(in srgb, var(--mui-palette-info-main) 32%, var(--mui-palette-background-paper))',
  '& .MuiAlert-icon': { color: 'info.main' },
} as const;

export default function InfoAlert({ children, sx, ...props }: InfoAlertProps) {
  return (
    <Alert severity="info" {...props} sx={[infoAlertSx, ...(Array.isArray(sx) ? sx : [sx])]}>
      {children}
    </Alert>
  );
}
