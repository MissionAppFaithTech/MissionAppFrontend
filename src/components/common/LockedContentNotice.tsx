'use client';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';

type LockedContentNoticeProps = {
  title?: string;
  description?: string;
  loginHref?: string;
  registerHref?: string;
};

export default function LockedContentNotice({
  title = 'Entre para ver o perfil completo',
  description = 'Pedidos de oração, contato e campanhas ficam visíveis para membros.',
  loginHref = '/login',
  registerHref = '/select-role',
}: LockedContentNoticeProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        textAlign: 'center',
        py: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Stack spacing={2} sx={{ alignItems: 'center', maxWidth: 420, mx: 'auto' }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: 'rgba(13, 43, 92, 0.08)',
              color: 'primary.main',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>

          <Stack spacing={0.75} sx={{ textAlign: 'center' }}>
            <Typography
              variant="subtitle1"
              component="h3"
              color="text.primary"
              sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.125rem' } }}
            >
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {description}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ pt: 1, justifyContent: 'center' }}>
            <PillButton
              href={loginHref}
              tone="primarySoftOutline"
              size="small"
              sx={{ px: 2.5, py: 0.75, minHeight: 38 }}
            >
              Fazer login
            </PillButton>
            <PillButton
              href={registerHref}
              tone="missionFilled"
              size="small"
              sx={{ px: 2.5, py: 0.75, minHeight: 38 }}
            >
              Cadastrar
            </PillButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
