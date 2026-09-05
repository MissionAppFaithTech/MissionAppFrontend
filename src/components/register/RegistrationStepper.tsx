'use client';

import { Box, Stack, Typography } from '@mui/material';

export interface RegistrationStepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  tone?: 'mission' | 'supporter';
}

export default function RegistrationStepper({
  currentStep,
  totalSteps,
  stepLabels,
  tone = 'mission',
}: RegistrationStepperProps) {
  const activeColor = tone === 'mission' ? 'mission.main' : 'primary.main';
  const progressPercent = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <Box component="nav" aria-label="Progresso do cadastro" sx={{ width: '100%', mb: 2.5 }}>
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography
          variant="caption"
          component="p"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '0.75rem',
          }}
        >
          Etapa {currentStep} de {totalSteps}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: activeColor,
            fontSize: '0.8125rem',
          }}
        >
          {stepLabels[currentStep - 1]}
        </Typography>
      </Stack>

      {/* Modern thin progress bar with smooth transition */}
      <Box
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Progresso: Etapa ${currentStep} de ${totalSteps} - ${stepLabels[currentStep - 1]}`}
        sx={{
          width: '100%',
          height: 6,
          bgcolor: 'action.hover',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${progressPercent}%`,
            bgcolor: activeColor,
            borderRadius: 3,
            transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </Box>

      {/* Step pill badges for quick visual reference */}
      <Stack direction="row" spacing={1} sx={{ mt: 1.5, justifyContent: 'space-between' }}>
        {stepLabels.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <Box
              key={label}
              aria-current={isCurrent ? 'step' : undefined}
              sx={{
                flex: 1,
                py: 0.75,
                px: 1,
                borderRadius: 2,
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: isCurrent ? 700 : 600,
                color: isCurrent ? '#ffffff' : isCompleted ? 'text.primary' : 'text.secondary',
                bgcolor: isCurrent ? activeColor : isCompleted ? 'action.hover' : 'transparent',
                border: '1px solid',
                borderColor: isCurrent ? activeColor : 'divider',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={`Etapa ${stepNum}: ${label}`}
            >
              {stepNum}. {label}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
