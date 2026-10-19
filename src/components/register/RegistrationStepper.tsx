'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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
}: RegistrationStepperProps) {
  const lastIndex = Math.max(totalSteps - 1, 1);
  const progressPercent = Math.min(100, Math.max(0, ((currentStep - 1) / lastIndex) * 100));

  return (
    <Box component="nav" aria-label="Progresso do cadastro" sx={{ width: '100%', mb: 4, pt: 0.5 }}>
      <Box
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Etapa ${currentStep} de ${totalSteps}: ${stepLabels[currentStep - 1] ?? ''}`}
        sx={{
          display: 'flex',
          position: 'relative',
          width: '100%',
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: `calc(100% / ${totalSteps} / 2)`,
            right: `calc(100% / ${totalSteps} / 2)`,
            bottom: 7,
            height: 2,
            bgcolor: 'action2.borderStrong',
            zIndex: 0,
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: `calc(100% / ${totalSteps} / 2)`,
            bottom: 7,
            height: 2,
            width: `calc((100% - 100% / ${totalSteps}) * ${progressPercent / 100})`,
            bgcolor: 'primary.main',
            zIndex: 1,
            transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {stepLabels.slice(0, totalSteps).map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const isActive = isCompleted || isCurrent;

          return (
            <Box
              key={label}
              aria-current={isCurrent ? 'step' : undefined}
              title={`Etapa ${stepNum}: ${label}`}
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 2,
                px: 0.5,
              }}
            >
              <Typography
                component="span"
                sx={{
                  mb: 1,
                  fontSize: { xs: '0.625rem', sm: '0.75rem' },
                  fontWeight: isActive ? 600 : 400,
                  lineHeight: 1.25,
                  textAlign: 'center',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  wordBreak: 'break-word',
                }}
              >
                {label}
              </Typography>
              <Box
                aria-hidden
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: isActive ? 'primary.main' : 'action2.borderStrong',
                  bgcolor: isCompleted ? 'primary.main' : 'common.white',
                  boxSizing: 'border-box',
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
