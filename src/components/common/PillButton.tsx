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
};

const hoverLightSx = {
  bgcolor: 'common.white',
  color: 'primary.main',
  borderColor: 'common.white',
  boxShadow: 'none',
};

/** Figma profile actions — um pouco mais compactos que o default do MUI. */
const figmaActionBase = {
  borderRadius: '10px',
  minHeight: 32,
  py: 0.5,
  px: 1.75,
  fontSize: '0.8125rem',
  fontWeight: 500,
  lineHeight: 1.25,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
  },
} as const;

const toneSx: Record<PillButtonTone, SxProps<Theme>> = {
  cta: {
    border: '2px solid',
    borderColor: 'primary.dark',
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    '&:hover': {
      bgcolor: 'connection.main',
      borderColor: 'connection.main',
      color: 'common.white',
      boxShadow: 'none',
    },
  },
  mission: {
    border: '2px solid',
    borderColor: 'mission.dark',
    bgcolor: 'mission.main',
    color: 'mission.contrastText',
    '&:hover': {
      bgcolor: 'connection.main',
      borderColor: 'connection.main',
      color: 'common.white',
      boxShadow: 'none',
    },
  },
  missionFlat: {
    border: '2px solid',
    borderColor: 'mission.dark',
    borderRadius: '6px',
    bgcolor: 'mission.main',
    color: 'mission.contrastText',
    '&:hover': {
      bgcolor: 'connection.main',
      borderColor: 'connection.main',
      color: 'common.white',
      boxShadow: 'none',
    },
  },
  missionOutline: {
    border: '2px solid',
    borderColor: 'mission.main',
    borderRadius: '6px',
    bgcolor: 'transparent',
    color: 'mission.main',
    '&:hover': {
      bgcolor: 'mission.main',
      borderColor: 'mission.dark',
      color: 'mission.contrastText',
      boxShadow: 'none',
    },
  },
  primaryOutline: {
    border: '2px solid',
    borderColor: 'primary.main',
    borderRadius: '6px',
    bgcolor: 'transparent',
    color: 'primary.main',
    '&:hover': {
      bgcolor: 'primary.main',
      borderColor: 'primary.dark',
      color: 'primary.contrastText',
      boxShadow: 'none',
    },
  },
  outline: {
    bgcolor: 'transparent',
    border: '2px solid',
    borderColor: 'primary.main',
    color: 'primary.main',
    '&:hover': {
      ...hoverLightSx,
      borderColor: 'primary.main',
    },
  },
  ghost: {
    bgcolor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    color: 'white',
    '&:hover': hoverLightSx,
  },
  /** Figma profile secondary actions: Contato / Compartilhar / Editar */
  primarySoftOutline: {
    ...figmaActionBase,
    // `&&` beats MUI `variant="text"` which sets `border: 0`
    '&&': {
      border: '1.5px solid',
      borderColor: 'primary.main',
      bgcolor: 'common.white',
      color: 'primary.main',
    },
    '&:hover': {
      ...figmaActionBase['&:hover'],
      bgcolor: 'rgba(13, 43, 92, 0.04)',
      borderColor: 'primary.main',
    },
  },
  primaryFilled: {
    ...figmaActionBase,
    border: 'none',
    bgcolor: 'primary.main',
    color: 'common.white',
    '&:hover': {
      ...figmaActionBase['&:hover'],
      bgcolor: 'primary.dark',
    },
  },
  missionFilled: {
    ...figmaActionBase,
    border: 'none',
    bgcolor: 'mission.main',
    color: 'common.white',
    '&:hover': {
      ...figmaActionBase['&:hover'],
      bgcolor: 'mission.dark',
    },
  },
};

export type { PillButtonTone, PillButtonProps };

export default function PillButton({ href, tone = 'cta', sx, ...props }: PillButtonProps) {
  const pillSx = [baseSx, toneSx[tone], sx] as SxProps<Theme>;

  if (href) {
    return <Button component={Link} href={href} sx={pillSx} {...props} />;
  }

  return <Button sx={pillSx} {...props} />;
}
