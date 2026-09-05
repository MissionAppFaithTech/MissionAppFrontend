'use client';

import { Stack, Typography } from '@mui/material';
import Link from 'next/link';
import PillButton from '@/components/common/PillButton';

type RegistrationEmailConfirmationProps = {
  email?: string;
};

export default function RegistrationEmailConfirmation({
  email,
}: RegistrationEmailConfirmationProps) {
  return (
    <Stack spacing={2.5} sx={{ width: '100%' }}>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        Cadastro realizado! Confirme seu e-mail
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Enviamos um e-mail de confirmação
        {email ? (
          <>
            {' '}
            para <strong>{email}</strong>
          </>
        ) : (
          ' para o endereço utilizado no cadastro'
        )}
        . Abra a mensagem e clique no link para liberar o acesso à plataforma.
      </Typography>

      <Typography variant="body2" color="text.secondary">
        A verificação do e-mail deve ser feita em até <strong>7 dias</strong>. Caso contrário, o
        cadastro será excluído automaticamente e será necessário realizar um novo registro.
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Não encontrou o e-mail? Verifique a caixa de spam ou lixo eletrônico. O link pode levar
        alguns minutos para chegar.
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Enquanto o e-mail não for confirmado, o login permanecerá bloqueado.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <PillButton
          component={Link}
          href="/login"
          tone="primarySoftOutline"
          fullWidth
          sx={{ minHeight: 48, fontSize: '1rem', fontWeight: 500 }}
        >
          Ir para login
        </PillButton>
        <PillButton
          component={Link}
          href="/"
          tone="cta"
          fullWidth
          sx={{ minHeight: 48, fontSize: '1rem', fontWeight: 600 }}
        >
          Ir para início
        </PillButton>
      </Stack>
    </Stack>
  );
}
