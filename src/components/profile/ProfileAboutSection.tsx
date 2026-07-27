'use client';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ProfileAboutData } from '@/types/profile';

type ProfileAboutSectionProps = {
  data: ProfileAboutData;
  onEdit: () => void;
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

export default function ProfileAboutSection({ data, onEdit }: ProfileAboutSectionProps) {
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
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditOutlinedIcon />}
              onClick={onEdit}
              sx={{
                px: { xs: 1.5, sm: 2.5 },
                minWidth: { xs: 0, sm: 96 },
              }}
            >
              Editar
            </Button>
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
            <DetailRow label="Agência Missionária" value={data.missionaryAgency} />
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
