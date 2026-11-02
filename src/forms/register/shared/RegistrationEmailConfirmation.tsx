'use client';

import { useEffect, type ElementType } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import LoginIcon from '@mui/icons-material/Login';
import HomeIcon from '@mui/icons-material/Home';
import PillButton from '@/components/common/PillButton';
import { useMissionaryRegisterStore } from '@/stores/missionaryRegisterStore';
import { useSupporterRegisterStore } from '@/stores/supporterRegisterStore';
import { BUTTON_BORDER_RADIUS, FORM_ACTION_BUTTON_SX } from '@/theme/theme';

const actionButtonSx = {
  ...FORM_ACTION_BUTTON_SX,
  fontWeight: 600,
  gap: 1,
} as const;

type NextStep = {
  title: string;
  description: string;
  icon: ElementType;
};

const reviewSteps: NextStep[] = [
  {
    title: 'Confirme seu e-mail',
    description: 'Clique no link enviado para seu e-mail.',
    icon: EmailOutlinedIcon,
  },
  {
    title: 'Seu cadastro será analisado',
    description: 'Nossa equipe verificará as informações cadastradas.',
    icon: SearchOutlinedIcon,
  },
  {
    title: 'Acesso liberado',
    description: 'Após a aprovação, você poderá começar a usar a plataforma.',
    icon: VerifiedIcon,
  },
];

const immediateAccessSteps: NextStep[] = [
  {
    title: 'Confirme seu e-mail',
    description: 'Clique no link enviado para seu e-mail.',
    icon: EmailOutlinedIcon,
  },
  {
    title: 'Acesso liberado',
    description: 'Após a confirmação, você poderá começar a usar a plataforma.',
    icon: VerifiedIcon,
  },
];

type RegistrationEmailConfirmationProps = {
  email?: string;
  /** Missionaries wait for admin review after verifying e-mail (RF 1.3). */
  requiresReview?: boolean;
};

export default function RegistrationEmailConfirmation({
  email,
  requiresReview = false,
}: RegistrationEmailConfirmationProps) {
  const steps = requiresReview ? reviewSteps : immediateAccessSteps;

  const handleResetStores = () => {
    useMissionaryRegisterStore.getState().reset();
    useSupporterRegisterStore.getState().reset();
  };

  useEffect(() => {
    return () => {
      // Ensure registration wizard state resets after departure so completion screen is shown once
      handleResetStores();
    };
  }, []);

  return (
    <Stack spacing={2.5} sx={{ width: '100%' }}>
      <Stack spacing={0.75}>
        <Typography
          component="h2"
          variant="h6"
          sx={{ fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
        >
          Cadastro realizado!
        </Typography>
        <Typography component="p" variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Confirme seu e-mail
        </Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Enviamos um e-mail de confirmação
        {email ? (
          <>
            {' '}
            para{' '}
            <Typography
              component="strong"
              variant="body2"
              sx={{ fontWeight: 700, color: 'text.primary', wordBreak: 'break-word' }}
            >
              {email}
            </Typography>
          </>
        ) : (
          ' para o endereço utilizado no cadastro'
        )}
        .
      </Typography>

      <Box
        component="section"
        aria-labelledby="registration-next-steps-title"
        sx={{
          border: '1px solid',
          borderColor: 'action2.borderSubtle',
          bgcolor: 'action2.secondaryHoverWash',
          borderRadius: BUTTON_BORDER_RADIUS,
          px: { xs: 1.75, sm: 2 },
          py: 1.75,
        }}
      >
        <Typography
          id="registration-next-steps-title"
          component="h3"
          variant="caption"
          sx={{
            display: 'block',
            mb: 1.5,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          O que acontece agora?
        </Typography>
        <Stack component="ol" spacing={1.5} sx={{ m: 0, pl: 0, listStyle: 'none' }}>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Box
                key={step.title}
                component="li"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 1.25,
                  minWidth: 0,
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    borderRadius: 1,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'common.white',
                    color: 'primary.main',
                    border: '1px solid',
                    borderColor: 'action2.borderSubtle',
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </Box>
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                    {step.description}
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary">
        {requiresReview
          ? 'Após confirmar seu e-mail, nossa equipe irá analisar seu cadastro. Você será informado por e-mail quando sua aprovação for concluída e o acesso à plataforma estiver liberado.'
          : 'Após confirmar seu e-mail, o acesso à plataforma será liberado. Enquanto isso, o login permanecerá bloqueado.'}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        A verificação do e-mail deve ser feita em até <strong>7 dias</strong>. Caso contrário, o
        cadastro será excluído automaticamente. Não encontrou o e-mail? Verifique a caixa de spam ou
        lixo eletrônico.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <PillButton
          href="/"
          tone="primarySoftOutline"
          fullWidth
          sx={actionButtonSx}
          startIcon={<HomeIcon />}
          onClick={handleResetStores}
        >
          Ir para início
        </PillButton>
        <PillButton
          href="/login"
          tone="cta"
          fullWidth
          sx={actionButtonSx}
          startIcon={<LoginIcon />}
          onClick={handleResetStores}
        >
          Ir para login
        </PillButton>
      </Stack>
    </Stack>
  );
}
