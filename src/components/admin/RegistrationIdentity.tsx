import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import type { MissionaryRegistration } from '@/types/admin';

export default function RegistrationIdentity({
  record,
  large = false,
}: {
  record: MissionaryRegistration;
  large?: boolean;
}) {
  return (
    <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: 'center', minWidth: 0 }}>
      <Avatar
        sx={{
          width: large ? 52 : 36,
          height: large ? 52 : 36,
          bgcolor: 'avatar.main',
          color: 'avatar.contrastText',
        }}
      >
        <PersonIcon aria-hidden />
      </Avatar>
      <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
        <Typography
          sx={{ fontWeight: large ? 700 : 500, fontSize: large ? '1.25rem' : '0.875rem' }}
        >
          {record.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {record.email}
        </Typography>
        {large && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {record.agency.name} · {record.church.name} · {record.location}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
