import { Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import SupportersPageContent from './SupportersPageContent';

function SupportersFallback() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress color="inherit" />
    </Box>
  );
}

export default function RegisterSupportersPage() {
  return (
    <Suspense fallback={<SupportersFallback />}>
      <SupportersPageContent />
    </Suspense>
  );
}
