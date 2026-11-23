'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { visuallyHiddenSx } from '@/lib/a11y';

export interface RegistrationStepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  tone?: 'mission' | 'supporter';
}

function stepStatus(stepNum: number, currentStep: number) {
  if (stepNum < currentStep) return 'concluída';
  if (stepNum === currentStep) return 'atual';
  return 'pendente';
}

/**
 * Registration progress as an ordered list: each step says in text whether it is
 * done, current or pending (never color alone), and the current one carries
 * `aria-current="step"`. The connecting line is decorative.
 */
export default function RegistrationStepper({
  currentStep,
  totalSteps,
  stepLabels,
}: RegistrationStepperProps) {
  const lastIndex = Math.max(totalSteps - 1, 1);
  const progressPercent = Math.min(100, Math.max(0, ((currentStep - 1) / lastIndex) * 100));

  return (
    <Box component="nav" aria-label="Progresso do cadastro" sx={{ width: '100%', mb: 4, pt: 0.5 }}>
      <Box component="p" sx={{ ...visuallyHiddenSx, m: 0 }}>
        Etapa {currentStep} de {totalSteps}
      </Box>
      <Box sx={{ position: 'relative', width: '100%' }}>
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
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }}
        />

        <Box
          component="ol"
          sx={{ display: 'flex', listStyle: 'none', m: 0, p: 0, position: 'relative', zIndex: 2 }}
        >
          {stepLabels.slice(0, totalSteps).map((label, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            const isActive = isCompleted || isCurrent;

            return (
              <Box
                component="li"
                key={label}
                aria-current={isCurrent ? 'step' : undefined}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
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
                  <Box component="span" sx={visuallyHiddenSx}>
                    {`, etapa ${stepNum}, ${stepStatus(stepNum, currentStep)}`}
                  </Box>
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
    </Box>
  );
}
