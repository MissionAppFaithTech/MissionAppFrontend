'use client';

import Box from '@mui/material/Box';
import { focusRingSx } from '@/theme/theme';

type SkipToContentProps = {
  contentId?: string;
  label?: string;
};

/**
 * Accessible Skip to Content component (WCAG 2.2 AA - Success Criterion 2.4.1 Bypass Blocks).
 * Remains visually hidden off-screen until focused via keyboard Tab key.
 */
export default function SkipToContent({
  contentId = 'main-content',
  label = 'Pular para o conteúdo principal',
}: SkipToContentProps) {
  return (
    <Box
      component="a"
      href={`#${contentId}`}
      sx={{
        position: 'fixed',
        top: -100,
        left: 16,
        zIndex: (theme) => theme.zIndex.tooltip + 100,
        bgcolor: 'brandFill.main',
        color: 'brandFill.contrastText',
        px: 3,
        py: 1.5,
        borderRadius: 2,
        fontWeight: 700,
        fontSize: '0.9375rem',
        textDecoration: 'none',
        boxShadow: 'var(--app-shadow-overlay)',
        border: '2px solid',
        borderColor: 'brandFill.contrastText',
        transition: 'top 0.2s ease-in-out',
        // Not a ButtonBase, so the theme-level focus ring does not reach it.
        '&:focus, &:focus-visible': (theme) => ({
          top: 16,
          ...focusRingSx(theme),
        }),
      }}
    >
      {label}
    </Box>
  );
}
