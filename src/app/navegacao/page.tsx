import type { Metadata } from 'next';
import { Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import NavigationPageContent from './NavigationPageContent';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Navegação e Descoberta | Mission App',
  description:
    'Explore o trabalho missionário pelo mundo. Encontre missionários, conheça projetos de impacto e participe de campanhas oficiais.',
  alternates: { canonical: '/navegacao' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Navegação e Descoberta | Mission App',
    description:
      'Explore causas, conheça missionários em campo e acompanhe projetos de impacto com transparência.',
    url: '/navegacao',
  },
};

function NavigationFallback() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress color="inherit" aria-label="Carregando página de navegação" />
    </Box>
  );
}

export default function NavigationPage() {
  return (
    <Suspense fallback={<NavigationFallback />}>
      <NavigationPageContent />
    </Suspense>
  );
}
