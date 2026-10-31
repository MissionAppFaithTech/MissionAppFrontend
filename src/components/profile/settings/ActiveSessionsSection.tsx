'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import {
  listActiveSessions,
  terminateAllSessions,
  type ActiveSession,
} from '@/services/auth.service';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useSessionStore } from '@/stores/sessionStore';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function describeSession(session: ActiveSession) {
  const device = session.deviceName || (session.deviceType === 'mobile' ? 'Celular' : 'Navegador');
  const lastUsed = session.lastUsedAt ?? session.createdAt;
  return { device, lastUsed: dateFormatter.format(new Date(lastUsed)) };
}

/** Lists the account's active sessions and ends all of them (backend `/auth/sessions`). */
export default function ActiveSessionsSection() {
  const router = useRouter();
  const notify = useFeedbackStore((s) => s.notify);
  const expire = useSessionStore((s) => s.expire);
  const [sessions, setSessions] = useState<ActiveSession[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  const showError = (err: unknown, fallback: string) =>
    setError(err instanceof Error ? err.message : fallback);

  useEffect(() => {
    let active = true;
    listActiveSessions().then(
      (data) => {
        if (active) setSessions(data);
      },
      (err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Não foi possível carregar as sessões');
        }
      }
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const retry = () => {
    setError(null);
    setSessions(null);
    setReloadKey((key) => key + 1);
  };

  const endAll = async () => {
    setEnding(true);
    try {
      await terminateAllSessions();
      expire();
      notify('Todas as sessões foram encerradas. Entre novamente.');
      router.replace('/login');
    } catch (err) {
      showError(err, 'Não foi possível encerrar as sessões');
      setEnding(false);
    }
  };

  return (
    <Card
      id="sessions-section"
      component="section"
      aria-labelledby="sessions-section-title"
      variant="outlined"
      sx={{ borderRadius: 3, scrollMarginTop: 80 }}
    >
      <CardHeader
        avatar={<DevicesOutlinedIcon color="primary" aria-hidden />}
        title="Sessões ativas"
        subheader="Aparelhos e navegadores conectados à sua conta"
        slotProps={{
          title: {
            id: 'sessions-section-title',
            component: 'h2',
            sx: { fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem' } },
          },
          subheader: { sx: { fontSize: '0.875rem' } },
        }}
      />
      <Divider />
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          {error ? (
            <Alert
              severity="error"
              role="alert"
              action={
                <PillButton tone="primarySoftOutline" size="small" onClick={retry}>
                  Tentar novamente
                </PillButton>
              }
            >
              {error}
            </Alert>
          ) : null}

          {sessions === null && !error ? (
            <Stack spacing={1} role="status" aria-busy="true" aria-label="Carregando sessões">
              <Skeleton variant="rounded" height={48} />
              <Skeleton variant="rounded" height={48} />
            </Stack>
          ) : null}

          {sessions && sessions.length > 0 ? (
            <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {sessions.map((session) => {
                const { device, lastUsed } = describeSession(session);
                return (
                  <Stack
                    component="li"
                    key={session.id}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 0.5, sm: 2 }}
                    useFlexGap
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      flexWrap: 'wrap',
                    }}
                  >
                    <Stack sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}
                      >
                        {device}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Último acesso: {lastUsed}
                      </Typography>
                    </Stack>
                    {session.current ? (
                      <Chip size="small" color="success" variant="outlined" label="Este aparelho" />
                    ) : null}
                  </Stack>
                );
              })}
            </Stack>
          ) : null}

          <Typography variant="body2" color="text.secondary">
            Encerrar todas as sessões desconecta todos os aparelhos, inclusive este. Você precisará
            entrar novamente.
          </Typography>
          <PillButton
            tone="dangerOutline"
            size="medium"
            onClick={endAll}
            loading={ending}
            sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, justifyContent: 'center' }}
          >
            Encerrar todas as sessões
          </PillButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
