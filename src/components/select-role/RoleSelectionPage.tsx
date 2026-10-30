'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import AuthLayout from '@/components/common/AuthLayout';
import PillButton from '@/components/common/PillButton';
import { FORM_ACTION_BUTTON_SX } from '@/theme/theme';

const roles = [
  { label: 'Sou um apoiador', href: '/register/supporters' },
  { label: 'Sou um missionário', href: '/register/missionaries' },
] as const;

export default function RoleSelectionPage() {
  return (
    <AuthLayout
      title="Como você quer usar o Mission app?"
      footerPrompt="Já tem uma conta?"
      footerActionLabel="Entrar"
      footerActionHref="/login"
      subFooter={
        <Typography
          component={Link}
          href="/"
          variant="body2"
          sx={{
            color: 'text.secondary',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            minHeight: 44,
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontWeight: 500,
            transition: 'color 0.2s ease, background-color 0.2s ease',
            '&:hover': {
              color: 'primary.main',
              backgroundColor: 'rgba(13, 43, 92, 0.04)',
              textDecoration: 'none',
            },
          }}
        >
          Voltar para a página inicial
        </Typography>
      }
    >
      <Stack spacing={1.5} sx={{ width: '100%' }}>
        {roles.map(({ label, href }) => (
          <PillButton key={href} href={href} tone="cta" fullWidth sx={FORM_ACTION_BUTTON_SX}>
            {label}
          </PillButton>
        ))}
      </Stack>
    </AuthLayout>
  );
}
