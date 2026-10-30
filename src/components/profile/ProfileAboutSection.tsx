'use client';

import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import type { ProfileAboutData } from '@/types/profile';

type ProfileAboutSectionProps = {
  data: ProfileAboutData;
  onEditAction: () => void;
};

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  if (!value || !value.trim()) return null;
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.25, sm: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>
        {label}:
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}

export default function ProfileAboutSection({ data, onEditAction }: ProfileAboutSectionProps) {
  const isAboutEmpty =
    !data.introduction?.trim() &&
    !data.missionHistory?.trim() &&
    !data.missionaryAgency?.trim() &&
    !data.faithCommunity?.trim() &&
    !data.prayerRequests?.trim() &&
    !data.lifeVerse?.trim();

  const hasDetailRows = Boolean(data.missionaryAgency?.trim() || data.faithCommunity?.trim());

  return (
    <Card
      component="section"
      elevation={0}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'var(--app-shadow-md)',
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
        }}
      >
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Sobre
            </Typography>
            <PillButton
              tone="primarySoftOutline"
              size="small"
              aria-label="Editar informações do sobre"
              onClick={onEditAction}
              sx={{
                minWidth: { xs: 44, sm: 'auto' },
                minHeight: { xs: 44, sm: 'auto' },
                width: { xs: 44, sm: 'auto' },
                height: { xs: 44, sm: 'auto' },
                px: { xs: 0, sm: 1.75 },
                py: { xs: 0, sm: 0.5 },
                gap: 0.5,
                // Mobile: só o lápis, sem caixa/borda. sm+: outline + label.
                '&&': {
                  border: { xs: 'none', sm: '1.5px solid' },
                  borderColor: {
                    xs: 'transparent',
                    sm: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'var(--mui-palette-action2-borderStrong)'
                        : 'primary.main',
                  },
                  bgcolor: {
                    xs: 'transparent',
                    sm: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'var(--mui-palette-action2-fieldBg)'
                        : 'common.white',
                  },
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? 'common.white' : 'primary.main',
                  boxShadow: 'none',
                },
                '&:hover': {
                  bgcolor: {
                    xs: 'transparent',
                    sm: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'var(--mui-palette-action2-borderSubtle)'
                        : 'rgba(13, 43, 92, 0.04)',
                  },
                  borderColor: {
                    xs: 'transparent',
                    sm: (theme) =>
                      theme.palette.mode === 'dark' ? 'connection.main' : 'primary.main',
                  },
                },
              }}
            >
              <EditOutlinedIcon
                sx={{
                  fontSize: { xs: 20, sm: 16 },
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? 'common.white' : 'primary.main',
                }}
              />
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Editar
              </Box>
            </PillButton>
          </Stack>

          {isAboutEmpty ? (
            <Box
              sx={{
                py: { xs: 3.5, sm: 5 },
                px: { xs: 2, sm: 3 },
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                border: '1.5px dashed',
                borderColor: 'divider',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'rgba(0, 0, 0, 0.015)',
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(249, 115, 22, 0.12)'
                      : 'rgba(249, 115, 22, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  color: 'primary.main',
                }}
              >
                <AutoStoriesOutlinedIcon sx={{ fontSize: 30, color: 'primary.main' }} />
              </Box>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  color: 'text.primary',
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                }}
              >
                Compartilhe sua história em missões
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 460, mb: 3, mx: 'auto', lineHeight: 1.6 }}
              >
                Seus dados de apresentação, histórico missionário, pedidos de oração e versículo
                ainda não foram preenchidos. Conte mais sobre seu ministério para que parceiros e
                apoiadores conheçam seu chamado!
              </Typography>
              <PillButton
                tone="mission"
                size="medium"
                onClick={onEditAction}
                sx={{
                  minHeight: 44,
                  px: 3,
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: 'center',
                }}
              >
                Preencher informações do Sobre
              </PillButton>
            </Box>
          ) : (
            <>
              {data.introduction?.trim() ? (
                <Typography variant="body2">{data.introduction}</Typography>
              ) : null}

              {data.introduction?.trim() &&
              (data.missionHistory?.trim() ||
                hasDetailRows ||
                data.prayerRequests?.trim() ||
                data.lifeVerse?.trim()) ? (
                <Divider />
              ) : null}

              {data.missionHistory?.trim() ? (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                    Resumo da minha história em missões:
                  </Typography>
                  <Typography variant="body2">{data.missionHistory}</Typography>
                </Box>
              ) : null}

              {data.missionHistory?.trim() &&
              (hasDetailRows || data.prayerRequests?.trim() || data.lifeVerse?.trim()) ? (
                <Divider />
              ) : null}

              {hasDetailRows ? (
                <Stack spacing={1.25}>
                  {data.missionaryAgency ? (
                    <DetailRow label="Agência Missionária" value={data.missionaryAgency} />
                  ) : null}
                  <DetailRow label="Comunidade de fé" value={data.faithCommunity} />
                </Stack>
              ) : null}

              {hasDetailRows && (data.prayerRequests?.trim() || data.lifeVerse?.trim()) ? (
                <Divider />
              ) : null}

              {data.prayerRequests?.trim() ? (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                    Pedidos de oração:
                  </Typography>
                  <Typography variant="body2">{data.prayerRequests}</Typography>
                </Box>
              ) : null}

              {data.prayerRequests?.trim() && data.lifeVerse?.trim() ? <Divider /> : null}

              {data.lifeVerse?.trim() ? (
                <Box sx={{ pt: 0.5 }}>
                  <DetailRow label="Versículo para a vida" value={data.lifeVerse} />
                </Box>
              ) : null}
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
