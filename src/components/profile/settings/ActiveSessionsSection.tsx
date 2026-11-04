'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import DevicesOtherOutlinedIcon from '@mui/icons-material/DevicesOtherOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import TabletAndroidOutlinedIcon from '@mui/icons-material/TabletAndroidOutlined';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SvgIconComponent } from '@mui/icons-material';
import PillButton from '@/components/common/PillButton';
import { queryKeys } from '@/lib/query/keys';
import { endSession, terminateAllSessions, type ActiveSession } from '@/services/auth.service';
import { useActiveSessions } from '@/services/queries/sessions';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { clearUserStores } from '@/stores/sessionStore';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const DEVICE_KINDS: Record<ActiveSession['deviceKind'], { label: string; Icon: SvgIconComponent }> =
  {
    desktop: { label: 'Computador', Icon: ComputerOutlinedIcon },
    mobile: { label: 'Celular', Icon: SmartphoneOutlinedIcon },
    tablet: { label: 'Tablet', Icon: TabletAndroidOutlinedIcon },
    unknown: { label: 'Aparelho', Icon: DevicesOtherOutlinedIcon },
  };

/** Sessions from before ADR-0007 have no device kind: the app client still tells a phone. */
function kindOf(session: ActiveSession): ActiveSession['deviceKind'] {
  if (session.deviceKind && session.deviceKind !== 'unknown') return session.deviceKind;
  return session.deviceType === 'mobile' ? 'mobile' : 'unknown';
}

export function describeSession(session: ActiveSession) {
  const kind = DEVICE_KINDS[kindOf(session)];
  return {
    kind,
    device: session.deviceName || kind.label,
    startedAt: dateFormatter.format(new Date(session.startedAt ?? session.createdAt)),
    lastUsed: dateFormatter.format(new Date(session.lastUsedAt ?? session.createdAt)),
  };
}

/** This device first, then the backend's order (most recent use). */
function currentFirst(sessions: ActiveSession[]) {
  return [...sessions].sort((a, b) => Number(b.current) - Number(a.current));
}

/**
 * Lists the account's active sessions, one per device (client island, ADR-0002),
 * and ends another device's session or all of them through Server Actions
 * (ADR-0006, ADR-0007). This device ends through logout, so it has no button.
 */
export default function ActiveSessionsSection() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notify = useFeedbackStore((s) => s.notify);
  const sessionsQuery = useActiveSessions();
  const sessions = sessionsQuery.data ? currentFirst(sessionsQuery.data) : null;
  const [endError, setEndError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [target, setTarget] = useState<ActiveSession | null>(null);
  const [endingOne, setEndingOne] = useState(false);
  const [endOneError, setEndOneError] = useState<string | null>(null);

  const loadError = sessionsQuery.error
    ? sessionsQuery.error instanceof Error
      ? sessionsQuery.error.message
      : 'Não foi possível carregar as sessões'
    : null;
  const error = endError ?? loadError;

  const retry = () => {
    setEndError(null);
    if (loadError) void sessionsQuery.refetch();
  };

  const endAll = async () => {
    setEnding(true);
    setEndError(null);
    try {
      await terminateAllSessions();
      clearUserStores();
      notify('Todas as sessões foram encerradas. Entre novamente.');
      router.replace('/login');
      router.refresh();
    } catch (err) {
      setEndError(err instanceof Error ? err.message : 'Não foi possível encerrar as sessões');
      setEnding(false);
    }
  };

  const openConfirm = (session: ActiveSession) => {
    setEndOneError(null);
    setTarget(session);
  };

  const closeConfirm = () => {
    if (!endingOne) setTarget(null);
  };

  const confirmEnd = async () => {
    if (!target) return;
    setEndingOne(true);
    setEndOneError(null);
    try {
      await endSession(target.id);
      await queryClient.invalidateQueries({ queryKey: queryKeys.activeSessions() });
      notify(`Sessão encerrada: ${describeSession(target).device}.`);
      setTarget(null);
    } catch (err) {
      setEndOneError(err instanceof Error ? err.message : 'Não foi possível encerrar a sessão');
    } finally {
      setEndingOne(false);
    }
  };

  const targetDevice = target ? describeSession(target) : null;

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

          {sessionsQuery.isPending && !loadError ? (
            <Stack spacing={1} role="status" aria-busy="true" aria-label="Carregando sessões">
              <Skeleton variant="rounded" height={72} />
              <Skeleton variant="rounded" height={72} />
            </Stack>
          ) : null}

          {sessions && sessions.length > 0 ? (
            <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {sessions.map((session) => {
                const { kind, device, startedAt, lastUsed } = describeSession(session);
                const { Icon } = kind;
                return (
                  <Stack
                    component="li"
                    key={session.id}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 1.5, sm: 2 }}
                    useFlexGap
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      justifyContent: 'space-between',
                      alignItems: { xs: 'stretch', sm: 'center' },
                      flexWrap: 'wrap',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ minWidth: 0, alignItems: 'center' }}>
                      <Icon color="action" aria-hidden sx={{ fontSize: 32, flexShrink: 0 }} />
                      <Stack sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}
                        >
                          {device}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {kind.label} · Conectado desde {startedAt}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Último acesso: {lastUsed}
                        </Typography>
                      </Stack>
                    </Stack>
                    {session.current ? (
                      <Chip
                        size="small"
                        color="success"
                        variant="outlined"
                        label="Este aparelho"
                        sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                      />
                    ) : (
                      <PillButton
                        tone="dangerOutline"
                        size="small"
                        onClick={() => openConfirm(session)}
                        aria-label={`Encerrar sessão: ${device}`}
                        sx={{
                          width: { xs: '100%', sm: 'auto' },
                          minHeight: 44,
                          justifyContent: 'center',
                        }}
                      >
                        Encerrar
                      </PillButton>
                    )}
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

      <Dialog
        open={Boolean(target)}
        onClose={closeConfirm}
        aria-labelledby="end-session-dialog-title"
        aria-describedby="end-session-dialog-description"
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1, maxWidth: 480, mx: 2 } } }}
      >
        <DialogTitle id="end-session-dialog-title" sx={{ fontWeight: 700 }}>
          Encerrar esta sessão?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="end-session-dialog-description" sx={{ color: 'text.primary' }}>
            {targetDevice
              ? `${targetDevice.device} (${targetDevice.kind.label.toLowerCase()}) será desconectado e precisará entrar novamente.`
              : null}
          </DialogContentText>
          {endOneError ? (
            <Alert severity="error" role="alert" sx={{ mt: 2 }}>
              {endOneError}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={1}
            useFlexGap
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <PillButton
              tone="primarySoftOutline"
              size="medium"
              onClick={closeConfirm}
              disabled={endingOne}
              autoFocus
              sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}
            >
              Cancelar
            </PillButton>
            <PillButton
              tone="danger"
              size="medium"
              onClick={confirmEnd}
              loading={endingOne}
              sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}
            >
              Encerrar sessão
            </PillButton>
          </Stack>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
