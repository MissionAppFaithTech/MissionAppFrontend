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
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        py: 6,
        position: 'relative',
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
