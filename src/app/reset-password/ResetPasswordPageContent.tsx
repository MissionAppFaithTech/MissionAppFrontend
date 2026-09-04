'use client';

import { Box, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/common/Logo';
import ResetPasswordForm from '@/forms/ResetPasswordForm';

export default function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <Box
      component="main"
      id="main-content"
      tabIndex={-1}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 6 },
        position: 'relative',
        outline: 'none',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle />
      </Box>

      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box sx={{ mb: 3 }}>
          <Logo size="md" />
        </Box>

        <Stack
          direction="row"
          sx={{
            mb: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">Nova senha</Typography>
          <Link
            href="/login"
            sx={{
              color: 'text.secondary',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            Voltar
          </Link>
        </Stack>

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            bgcolor: 'transparent',
            boxShadow: 'none',
          }}
        >
          <CardContent>
            <ResetPasswordForm token={token} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
