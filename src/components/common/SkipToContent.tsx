'use client';

import Box from '@mui/material/Box';

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
        bgcolor: 'primary.main',
        color: 'common.white',
        px: 3,
        py: 1.5,
        borderRadius: 2,
        fontWeight: 700,
        fontSize: '0.9375rem',
        textDecoration: 'none',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        border: '2px solid',
        borderColor: 'common.white',
        transition: 'top 0.2s ease-in-out',
        '&:focus, &:focus-visible': {
          top: 16,
          outline: '3px solid #E65100',
          outlineOffset: '2px',
        },
      }}
    >
      {label}
    </Box>
  );
}
