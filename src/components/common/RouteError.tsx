'use client';

import { useEffect } from 'react';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import PillButton from '@/components/common/PillButton';

type RouteErrorProps = {
  error: unknown;
  retry: () => void;
  /** Visible heading, e.g. "Não foi possível carregar o perfil". */
  title: string;
};

/** Accessible fallback for a route `error.tsx`: says what failed and offers a retry. */
export default function RouteError({ error, retry, title }: RouteErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container
      component="main"
      id="main-content"
      tabIndex={-1}
      maxWidth="sm"
      sx={{ px: { xs: 2, sm: 3 }, py: { xs: 4, sm: 6 }, outline: 'none' }}
    >
      <Stack spacing={2.5}>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Alert severity="error" role="alert">
          O servidor não respondeu agora. Tente novamente em alguns instantes.
        </Alert>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap>
          <PillButton
            tone="cta"
            onClick={() => retry()}
            sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}
          >
            Tentar novamente
          </PillButton>
          <PillButton
            tone="primaryOutline"
            href="/"
            sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}
          >
            Ir para o início
          </PillButton>
        </Stack>
      </Stack>
    </Container>
  );
}
