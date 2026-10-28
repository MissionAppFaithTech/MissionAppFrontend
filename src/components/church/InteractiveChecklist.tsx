'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PillButton from '@/components/common/PillButton';
import useHasMounted from '@/lib/useHasMounted';
import {
  useChurchChecklistStore,
  getChecklistProgressPercentage,
  getChecklistProgressStatus,
} from '@/stores/churchChecklistStore';
import { CHECKLIST_PHASES, type ChecklistPhase } from './churchGuideData';

export default function InteractiveChecklist() {
  const hasMounted = useHasMounted();
  const completedPhases = useChurchChecklistStore((s) => s.completedPhases);
  const togglePhase = useChurchChecklistStore((s) => s.togglePhase);
  const reset = useChurchChecklistStore((s) => s.reset);

  const isClient = hasMounted;
  const activeCompletedPhases = isClient ? completedPhases : [];

  const handleTogglePhase = (phaseId: string) => {
    togglePhase(phaseId);
  };

  const handleReset = () => {
    reset();
  };

  const progressPercentage = getChecklistProgressPercentage(activeCompletedPhases.length);
  const progressStatus = getChecklistProgressStatus(progressPercentage);

  return (
    <Box component="section" aria-labelledby="checklist-heading" sx={{ width: '100%' }}>
      {/* Header and Progress Bar */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          mb: 4,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: (theme) =>
            theme.palette.mode === 'dark'
              ? '1px solid var(--mui-palette-action2-borderSubtle)'
              : '1px solid var(--mui-palette-divider)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark' ? 'none' : '0 4px 20px rgba(13, 43, 92, 0.06)',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
          }}
        >
          <Box>
            <Typography
              id="checklist-heading"
              component="h3"
              sx={{
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                fontWeight: 700,
                color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
              }}
            >
              Progresso de Implantação do Conselho
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {isClient ? progressStatus : 'Acompanhe as 5 etapas de criação'}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Chip
              label={`${isClient ? progressPercentage : 0}% Concluído`}
              color={progressPercentage === 100 ? 'success' : 'primary'}
              sx={{
                fontWeight: 700,
                fontSize: '0.875rem',
                height: 32,
                bgcolor: progressPercentage === 100 ? 'success.main' : 'primary.main',
                color: 'common.white',
              }}
            />
            {isClient && completedPhases.length > 0 && (
              <PillButton
                tone="primarySoftOutline"
                size="small"
                onClick={handleReset}
                aria-label="Reiniciar progresso do checklist"
                startIcon={<RestartAltIcon fontSize="small" />}
                sx={{ minHeight: 36, fontSize: '0.8125rem' }}
              >
                Resetar
              </PillButton>
            )}
          </Stack>
        </Stack>

        {/* Accessible Progress Bar */}
        <Box sx={{ width: '100%', mt: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={isClient ? progressPercentage : 0}
            aria-label="Progresso do checklist do conselho missionário"
            aria-valuenow={isClient ? progressPercentage : 0}
            aria-valuemin={0}
            aria-valuemax={100}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(13, 43, 92, 0.08)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                bgcolor: progressPercentage === 100 ? 'success.main' : 'accent.main',
                transition: 'transform 0.4s ease',
              },
            }}
          />
        </Box>
      </Card>

      {/* Checklist Phases List */}
      <Stack spacing={2.5}>
        {CHECKLIST_PHASES.map((phase: ChecklistPhase) => {
          const isCompleted = isClient && completedPhases.includes(phase.id);
          const inputId = `checklist-phase-${phase.id}`;

          return (
            <Card
              key={phase.id}
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 3,
                bgcolor: isCompleted
                  ? (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(21, 128, 61, 0.12)'
                        : 'rgba(21, 128, 61, 0.04)'
                  : 'background.paper',
                border: (theme) =>
                  isCompleted
                    ? `2px solid ${theme.palette.success.main}`
                    : theme.palette.mode === 'dark'
                      ? '1px solid var(--mui-palette-action2-borderSubtle)'
                      : '1px solid var(--mui-palette-divider)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: isCompleted ? 'success.main' : 'primary.main',
                },
              }}
            >
              <Stack
                direction="row"
                spacing={{ xs: 1.5, sm: 2.5 }}
                sx={{ alignItems: 'flex-start' }}
              >
                <Checkbox
                  id={inputId}
                  checked={isCompleted}
                  onChange={() => handleTogglePhase(phase.id)}
                  aria-label={`Marcar como concluída: ${phase.title}`}
                  icon={
                    <RadioButtonUncheckedIcon
                      sx={{
                        fontSize: 28,
                        color: (t) =>
                          t.palette.mode === 'dark' ? 'text.secondary' : 'primary.main',
                      }}
                    />
                  }
                  checkedIcon={<CheckCircleIcon sx={{ fontSize: 28, color: 'success.main' }} />}
                  sx={{
                    p: 0.5,
                    mt: 0.25,
                    minWidth: 44,
                    minHeight: 44,
                  }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    component="label"
                    htmlFor={inputId}
                    sx={{
                      display: 'block',
                      fontSize: { xs: '1.05rem', sm: '1.2rem' },
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: isCompleted ? 'line-through' : 'none',
                      color: isCompleted
                        ? 'text.secondary'
                        : (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {phase.title}
                  </Typography>

                  <Box sx={{ mt: 1.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: (t) => (t.palette.mode === 'dark' ? 'accent.light' : 'accent.main'),
                        mb: 0.5,
                      }}
                    >
                      Ação prática:
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ lineHeight: 1.6, mb: 1.5 }}
                    >
                      {phase.action}
                    </Typography>

                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.04)'
                            : 'rgba(13, 43, 92, 0.04)',
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          fontWeight: 700,
                          color: (t) =>
                            t.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          mb: 0.5,
                        }}
                      >
                        Diretriz Prática
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                        {phase.guideline}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Stack>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
