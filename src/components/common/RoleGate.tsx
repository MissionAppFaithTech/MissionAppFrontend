'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useRoleGuard } from '@/lib/auth/useRoleGuard';

/** Renders its area only after the role check passes (see `lib/auth/rbac.ts`). */
export default function RoleGate({ children }: { children: ReactNode }) {
  const status = useRoleGuard();
  if (status === 'allowed') return children;

  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy="true"
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 2,
      }}
    >
      <CircularProgress aria-hidden size={32} />
      <Typography variant="body2" color="text.secondary">
        Verificando seu acesso…
      </Typography>
    </Box>
  );
}
