import type { Metadata } from 'next';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Logo from '@/components/common/Logo';
import PillButton from '@/components/common/PillButton';

export const metadata: Metadata = {
  title: 'Página não encontrada',
  robots: { index: false, follow: false },
};

/** 404 for the whole app, including `notFound()` from public profiles (ADR-0004). */
export default function NotFound() {
  return (
    <Container
      component="main"
      id="main-content"
      tabIndex={-1}
      maxWidth="sm"
      sx={{ px: { xs: 2, sm: 3 }, py: { xs: 4, sm: 8 }, outline: 'none' }}
    >
      <Stack spacing={2.5} sx={{ alignItems: { xs: 'stretch', sm: 'flex-start' } }}>
        <Logo href="/" size="md" />
        <Typography
          component="h1"
          variant="h4"
          sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          Página não encontrada
        </Typography>
        <Typography color="text.secondary">
          O endereço pode estar errado, ou este perfil não está disponível publicamente.
        </Typography>
        <PillButton
          tone="cta"
          href="/"
          sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}
        >
          Ir para o início
        </PillButton>
      </Stack>
    </Container>
  );
}
