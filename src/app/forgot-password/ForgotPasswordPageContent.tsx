'use client';

import Typography from '@mui/material/Typography';
import Link from 'next/link';
import AuthLayout from '@/components/common/AuthLayout';
import ForgotPasswordForm from '@/forms/ForgotPasswordForm';

export default function ForgotPasswordPageContent() {
  return (
    <AuthLayout
      logoSize="md"
      title="Esqueci minha senha"
      subFooter={
        <Typography
          component={Link}
          href="/login"
          variant="body2"
          sx={{
            color: 'text.secondary',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            minHeight: 44,
            px: 1,
            '&:hover': { color: 'primary.main', textDecoration: 'underline' },
          }}
        >
          Voltar
        </Typography>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
