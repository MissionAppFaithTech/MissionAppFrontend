'use client';

import type { ElementType, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import PillButton, { type PillButtonTone } from '@/components/common/PillButton';

export interface EmptyStateProps {
  /** Ícone descritivo contextual */
  icon?: ElementType;
  /** Título direto e amigável */
  title: string;
  /** Texto explicativo e orientador */
  description: string;
  /** Rótulo para o botão de ação / recuperação */
  actionLabel?: string;
  /** Link de redirecionamento do botão de ação */
  actionHref?: string;
  /** Callback para clique no botão de ação */
  onAction?: () => void;
  /** Tom visual do PillButton */
  actionTone?: PillButtonTone;
  /** Conteúdo extra opcional */
  children?: ReactNode;
}

export default function EmptyState({
  icon: Icon = SearchOffOutlinedIcon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  actionTone = 'missionFlat',
  children,
}: EmptyStateProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: { xs: 3, sm: 4, md: 5 },
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: '1.5px dashed',
        borderColor: 'divider',
        maxWidth: 520,
        width: '100%',
        mx: 'auto',
        my: { xs: 2, sm: 3 },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: { xs: 56, sm: 64 },
          height: { xs: 56, sm: 64 },
          borderRadius: '50%',
          bgcolor: 'action.hover',
          color: 'primary.main',
          mb: 2,
        }}
      >
        <Icon sx={{ fontSize: { xs: 32, sm: 38 } }} />
      </Box>

      <Typography
        component="h3"
        variant="h6"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          fontSize: { xs: '1.125rem', sm: '1.25rem' },
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          maxWidth: 420,
          lineHeight: 1.6,
          mb: actionLabel || children ? 3 : 0,
        }}
      >
        {description}
      </Typography>

      {actionLabel && (
        <PillButton
          href={actionHref}
          onClick={onAction}
          tone={actionTone}
          sx={{
            minHeight: 44,
            px: 3,
            py: 1,
            fontWeight: 600,
          }}
        >
          {actionLabel}
        </PillButton>
      )}

      {children}
    </Box>
  );
}
