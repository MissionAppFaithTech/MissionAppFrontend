'use client';

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
  return (
    <Card
      component="section"
      elevation={0}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 3px 8px rgba(13, 43, 92, 0.16)',
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
            <Typography variant="h6" color="primary.main">
              Sobre
            </Typography>
            <PillButton
              tone="primarySoftOutline"
              size="small"
              aria-label="Editar"
              onClick={onEditAction}
              sx={{
                minWidth: { xs: 32, sm: 'auto' },
                width: { xs: 32, sm: 'auto' },
                height: { xs: 32, sm: 'auto' },
                px: { xs: 0, sm: 1.75 },
                py: { xs: 0, sm: 0.5 },
                gap: 0.5,
                // Mobile: só o lápis, sem caixa/borda. sm+: outline + label.
                '&&': {
                  border: { xs: 'none', sm: '1.5px solid' },
                  borderColor: { xs: 'transparent', sm: 'primary.main' },
                  bgcolor: { xs: 'transparent', sm: 'common.white' },
                  boxShadow: 'none',
                },
                '&:hover': {
                  bgcolor: { xs: 'transparent', sm: 'rgba(13, 43, 92, 0.04)' },
                  borderColor: { xs: 'transparent', sm: 'primary.main' },
                },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: { xs: 20, sm: 16 }, color: 'primary.main' }} />
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Editar
              </Box>
            </PillButton>
          </Stack>

          <Typography variant="body2">{data.introduction}</Typography>

          <Divider />

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
              Resumo da minha história em missões:
            </Typography>
            <Typography variant="body2">{data.missionHistory}</Typography>
          </Box>

          <Divider />

          <Stack spacing={1.25}>
            <DetailRow label="Local de origem" value={data.originLocation} />
            <DetailRow label="Local de atuação atual" value={data.currentLocation} />
            {data.missionaryAgency ? (
              <DetailRow label="Agência Missionária" value={data.missionaryAgency} />
            ) : null}
            <DetailRow label="Comunidade de fé" value={data.faithCommunity} />
          </Stack>

          <Divider />

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
              Pedidos de oração:
            </Typography>
            <Typography variant="body2">{data.prayerRequests}</Typography>
          </Box>

          <Box sx={{ pt: 1.5 }}>
            <DetailRow label="Versículo para a vida" value={data.lifeVerse} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
