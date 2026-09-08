import VerifiedIcon from '@mui/icons-material/Verified';

import Chip from '@mui/material/Chip';
import type { SxProps, Theme } from '@mui/material/styles';

type CampaignBadgeProps = {
  label?: string;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
};

export default function CampaignBadge({
  label = 'Selo Oficial de Campanha',
  size = 'medium',
  sx,
}: CampaignBadgeProps) {
  const isSmall = size === 'small';

  return (
    <Chip
      icon={<VerifiedIcon sx={{ fontSize: isSmall ? 16 : 18, color: 'accent.main !important' }} />}
      label={label}
      size={size}
      sx={{
        bgcolor: 'var(--app-badge-bg)',
        color: 'accent.dark',
        border: '1px solid',
        borderColor: 'var(--app-badge-border)',
        fontWeight: 700,
        fontSize: isSmall ? '0.75rem' : '0.8125rem',
        letterSpacing: '0.02em',
        borderRadius: 2,
        px: 0.5,
        height: isSmall ? 28 : 32,
        ...sx,
      }}
    />
  );
}
