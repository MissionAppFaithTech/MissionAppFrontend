'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LockedContentNotice from '@/components/common/LockedContentNotice';
import type { ProfileAboutData } from '@/types/profile';

type VisitorProfileAboutSectionProps = {
  data: ProfileAboutData;
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

export default function VisitorProfileAboutSection({ data }: VisitorProfileAboutSectionProps) {
  return (
    <Card
      component="section"
      elevation={0}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 3px 8px rgba(13, 43, 92, 0.14)',
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2.5, sm: 3.5, md: 4 },
          '&:last-child': { pb: { xs: 2.5, sm: 3.5, md: 4 } },
        }}
      >
        <Stack spacing={{ xs: 2.5, sm: 3 }}>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
            Sobre
          </Typography>

          {data.introduction ? (
            <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
              {data.introduction}
            </Typography>
          ) : null}

          <Divider />

          {data.missionHistory ? (
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Resumo da história em missões:
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {data.missionHistory}
              </Typography>
            </Stack>
          ) : null}

          <Divider />

          <Stack spacing={1.25}>
            {data.originLocation ? (
              <DetailRow label="Local de origem" value={data.originLocation} />
            ) : null}
            {data.currentLocation ? (
              <DetailRow label="Local de atuação atual" value={data.currentLocation} />
            ) : null}
            {data.missionaryAgency ? (
              <DetailRow label="Agência Missionária" value={data.missionaryAgency} />
            ) : null}
          </Stack>

          {/* Seção bloqueada para membros cadastrados */}
          <LockedContentNotice
            title="Entre para ver o perfil completo"
            description="Pedidos de oração, canais de contato e detalhes de campanhas ficam visíveis para membros."
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
