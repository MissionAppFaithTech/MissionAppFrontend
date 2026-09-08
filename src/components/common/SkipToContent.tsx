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
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(contentId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      target.focus({ preventScroll: true });
      e.currentTarget.blur();
    }
  };

  return (
    <Box
      component="a"
      href={`#${contentId}`}
      onClick={handleClick}
      sx={{
        position: 'fixed',
        top: 16,
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
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
        border: '2px solid',
        borderColor: 'common.white',
        opacity: 0,
        pointerEvents: 'none',
        transform: 'translateY(-200%)',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
        '&:focus-visible': {
          transform: 'translateY(0)',
          opacity: 1,
          pointerEvents: 'auto',
          outline: '3px solid #FB923C',
          outlineOffset: '2px',
        },
      }}
    >
      {label}
    </Box>
  );
}
