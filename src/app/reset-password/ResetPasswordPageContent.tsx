'use client';

import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/common/AuthLayout';
import ResetPasswordForm from '@/forms/ResetPasswordForm';

export default function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <AuthLayout
      logoSize="md"
      title="Nova senha"
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
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
