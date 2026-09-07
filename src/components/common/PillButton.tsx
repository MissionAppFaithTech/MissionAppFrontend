'use client';

import Button, { type ButtonProps } from '@mui/material/Button';
import type { SxProps, Theme } from '@mui/material/styles';
import Link from 'next/link';

/**
 * Branded button — prefer this over raw MUI Button for product CTAs.
 * Extend with a new `tone` before creating another button component.
 * See AGENTS.md → UI component reuse.
 */
type PillButtonTone =
  | 'cta'
  | 'mission'
  | 'missionFlat'
  | 'missionOutline'
  | 'primaryOutline'
  | 'outline'
  | 'ghost'
  | 'primarySoftOutline'
  | 'primaryFilled'
  | 'missionFilled';

type PillButtonProps = ButtonProps & {
  href?: string;
  tone?: PillButtonTone;
  target?: string;
  rel?: string;
};

const baseSx = {
  borderRadius: '16px',
  py: 0.5,
  px: 2,
  fontWeight: 500,
  fontSize: '0.9375rem',
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  '&:focus-visible': {
    outline: '2px solid #0D2B5C',
    outlineOffset: '2px',
  },
};

/** Figma profile actions — um pouco mais compactos que o default do MUI. */
const figmaActionBase = {
  borderRadius: '10px',
  minHeight: { xs: 44, sm: 32 },
  py: 0.5,
  px: 1.75,
  fontSize: '0.8125rem',
  fontWeight: 500,
  lineHeight: 1.25,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
  },
  '&:focus-visible': {
    outline: '2px solid #0D2B5C',
    outlineOffset: '2px',
  },
} as const;

const toneSx: Record<PillButtonTone, SxProps<Theme>> = {
  cta: {
    '&&': {
      border: '2px solid',
      borderColor: (theme) => (theme.palette.mode === 'dark' ? 'primary.main' : 'primary.dark'),
      bgcolor: 'primary.main',
      color: (theme) => (theme.palette.mode === 'dark' ? 'primary.contrastText' : '#ffffff'),
    },
    '&:hover': {
      '&&': {
        bgcolor: 'connection.main',
        borderColor: 'connection.main',
        color: '#ffffff',
        boxShadow: 'none',
      },
    },
  },
  mission: {
    '&&': {
      border: '2px solid',
      borderColor: 'mission.dark',
      bgcolor: 'mission.main',
      color: '#ffffff',
    },
    '&:hover': {
      '&&': {
        bgcolor: 'mission.dark',
        borderColor: 'mission.dark',
        color: '#ffffff',
        boxShadow: 'none',
      },
    },
  },
  missionFlat: {
    '&&': {
      border: '2px solid',
      borderColor: 'mission.dark',
      borderRadius: '6px',
      bgcolor: 'mission.main',
      color: '#ffffff',
    },
    '&:hover': {
      '&&': {
        bgcolor: 'mission.dark',
        borderColor: 'mission.dark',
        color: '#ffffff',
        boxShadow: 'none',
      },
    },
  },
  missionOutline: {
    '&&': {
      border: '2px solid',
      borderColor: (theme) => (theme.palette.mode === 'dark' ? '#FB923C' : 'mission.main'),
      borderRadius: '6px',
      bgcolor: 'transparent',
      color: (theme) => (theme.palette.mode === 'dark' ? '#FB923C' : 'mission.main'),
    },
    '&:hover': {
      '&&': {
        bgcolor: 'mission.main',
        borderColor: 'mission.dark',
        color: '#ffffff',
        boxShadow: 'none',
      },
    },
  },
  primaryOutline: {
    '&&': {
      border: '2px solid',
      borderColor: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'primary.main',
      borderRadius: '6px',
      bgcolor: 'transparent',
      color: (theme) => (theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
    },
    '&:hover': {
      '&&': {
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(13, 43, 92, 0.06)',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? 'common.white' : 'primary.dark'),
        color: (theme) => (theme.palette.mode === 'dark' ? 'common.white' : 'primary.dark'),
        boxShadow: 'none',
      },
    },
  },
  outline: {
    '&&': {
      border: '2px solid',
      borderColor: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'primary.main',
      bgcolor: 'transparent',
      color: (theme) => (theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
    },
    '&:hover': {
      '&&': {
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(13, 43, 92, 0.06)',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? 'common.white' : 'primary.dark'),
        color: (theme) => (theme.palette.mode === 'dark' ? 'common.white' : 'primary.dark'),
      },
    },
  },
  ghost: {
    '&&': {
      border: '1px solid rgba(255, 255, 255, 0.35)',
      bgcolor: 'transparent',
      color: '#ffffff',
    },
    '&:hover': {
      '&&': {
        bgcolor: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'common.white',
        color: '#ffffff',
      },
    },
  },
  /** Figma profile secondary actions: Contato / Compartilhar / Editar */
  primarySoftOutline: {
    ...figmaActionBase,
    '&&': {
      border: '1.5px solid',
      borderColor: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.35)' : 'primary.main',
      bgcolor: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'common.white',
      color: (theme) => (theme.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
    },
    '&:hover': {
      ...figmaActionBase['&:hover'],
      '&&': {
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(13, 43, 92, 0.05)',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? 'common.white' : 'primary.dark'),
        color: (theme) => (theme.palette.mode === 'dark' ? 'common.white' : 'primary.dark'),
      },
    },
  },
  primaryFilled: {
    ...figmaActionBase,
    '&&': {
      border: 'none',
      bgcolor: 'primary.main',
      color: (theme) => (theme.palette.mode === 'dark' ? 'primary.contrastText' : '#ffffff'),
    },
    '&:hover': {
      ...figmaActionBase['&:hover'],
      '&&': {
        bgcolor: 'primary.dark',
        color: (theme) => (theme.palette.mode === 'dark' ? 'primary.contrastText' : '#ffffff'),
      },
    },
  },
  missionFilled: {
    ...figmaActionBase,
    '&&': {
      border: 'none',
      bgcolor: 'mission.main',
      color: '#ffffff',
    },
    '&:hover': {
      ...figmaActionBase['&:hover'],
      '&&': {
        bgcolor: 'mission.dark',
        color: '#ffffff',
      },
    },
  },
};

export type { PillButtonTone, PillButtonProps };

export default function PillButton({ href, tone = 'cta', sx, ...props }: PillButtonProps) {
  const pillSx = [baseSx, toneSx[tone], sx] as SxProps<Theme>;

  if (href) {
    return <Button component={Link} href={href} color="inherit" sx={pillSx} {...props} />;
  }

  return <Button color="inherit" sx={pillSx} {...props} />;
}
