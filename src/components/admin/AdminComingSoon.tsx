'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Logo from '@/components/common/Logo';
import PillButton from '@/components/common/PillButton';
import RoleGate from '@/components/common/RoleGate';
import PageNavbar from '@/components/layout/PageNavbar';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useSessionStore } from '@/stores/sessionStore';

/** ADMIN home until the admin panel (RF 17–18) exists. Only ADMIN gets past the gate. */
export default function AdminComingSoon() {
  const router = useRouter();
  const logout = useSessionStore((state) => state.logout);
  const notify = useFeedbackStore((state) => state.notify);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } catch {
      notify('Não foi possível sair agora. Verifique sua conexão e tente novamente.', 'error');
      setLoggingOut(false);
    }
  };

  return (
    <>
      <PageNavbar maxWidth="md">
        <Logo size="lg" variant="dark" />
      </PageNavbar>
      <Container
        component="main"
        id="main-content"
        tabIndex={-1}
        maxWidth="sm"
        sx={{ py: { xs: 4, sm: 8 }, px: { xs: 2, sm: 3 } }}
      >
        <RoleGate>
          <Paper
            component="section"
            aria-labelledby="admin-coming-soon-title"
            variant="outlined"
            sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, textAlign: 'center' }}
          >
            <Stack spacing={2} sx={{ alignItems: 'center' }}>
              <AdminPanelSettingsOutlinedIcon aria-hidden color="primary" sx={{ fontSize: 48 }} />
              <Typography
                id="admin-coming-soon-title"
                component="h1"
                sx={{ fontWeight: 700, fontSize: { xs: '1.375rem', sm: '1.75rem' } }}
              >
                Painel administrativo em breve
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
                Você entrou como administrador. O painel de aprovação de missionários, campanhas e
                denúncias ainda está em construção.
              </Typography>
              <PillButton
                tone="primarySoftOutline"
                onClick={handleLogout}
                disabled={loggingOut}
                startIcon={<LogoutIcon aria-hidden />}
                sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'center', minHeight: 44 }}
              >
                {loggingOut ? 'Saindo…' : 'Sair da conta'}
              </PillButton>
            </Stack>
          </Paper>
        </RoleGate>
      </Container>
    </>
  );
}
