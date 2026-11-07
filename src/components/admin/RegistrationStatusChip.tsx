import Chip from '@mui/material/Chip';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import type { RegistrationStatus } from '@/types/admin';

export const registrationStatusLabels = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Reprovado',
} as const;
const statusAppearance = {
  pending: { color: 'warning', Icon: AccessTimeOutlinedIcon },
  approved: { color: 'success', Icon: CheckCircleOutlineIcon },
  rejected: { color: 'error', Icon: HighlightOffIcon },
} as const;

export default function RegistrationStatusChip({ status }: { status: RegistrationStatus }) {
  const { color, Icon } = statusAppearance[status];
  return (
    <Chip
      icon={<Icon aria-hidden />}
      label={registrationStatusLabels[status]}
      size="small"
      color={color}
      variant="outlined"
      sx={(theme) => ({
        borderRadius: 1,
        fontSize: '0.75rem',
        border: 0,
        color: `${color}.dark`,
        bgcolor: `color-mix(in srgb, ${(theme.vars ?? theme).palette[color].main} 7%, ${(theme.vars ?? theme).palette.background.paper})`,
        ...theme.applyStyles('dark', { color: (theme.vars ?? theme).palette[color].main }),
        '& .MuiChip-icon': { fontSize: 15 },
      })}
    />
  );
}
