import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

type PublicPageFallbackProps = {
  /** Accessible name of the loading state, e.g. "Carregando perfil". */
  label: string;
};

/**
 * Loading state of a public page while its route params resolve (Cache
 * Components `<Suspense>` boundary). Keeps the single `<main>` landmark and
 * announces the wait to screen readers.
 */
export default function PublicPageFallback({ label }: PublicPageFallbackProps) {
  return (
    <Container
      component="main"
      id="main-content"
      tabIndex={-1}
      maxWidth="lg"
      sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 }, outline: 'none' }}
    >
      <Stack spacing={2} role="status" aria-live="polite" aria-busy="true" aria-label={label}>
        <Skeleton variant="rounded" sx={{ height: { xs: 160, md: 200 } }} />
        <Skeleton variant="rounded" sx={{ height: { xs: 240, md: 320 } }} />
        <Box component="span" sx={visuallyHidden}>
          {label}…
        </Box>
      </Stack>
    </Container>
  );
}

// Pixel strings: in MUI `sx`, a bare 1 means 100%.
const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;
