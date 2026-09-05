import VerifiedIcon from '@mui/icons-material/Verified';

import Chip from '@mui/material/Chip';
import type { SxProps, Theme } from '@mui/material/styles';

type CampaignBadgeProps = {
  label?: string;
  size?: 'small' | 'medium';
  variant?: 'default' | 'hero';
  sx?: SxProps<Theme>;
};

export default function CampaignBadge({
  label = 'Selo Oficial de Campanha',
  size = 'medium',
  variant = 'default',
  sx,
}: CampaignBadgeProps) {
  const isSmall = size === 'small';
  const isHero = variant === 'hero';

  return (
    <Chip
      icon={
        <VerifiedIcon
          sx={{
            fontSize: isSmall ? 16 : 18,
            color: isHero ? '#FB923C !important' : 'mission.main !important',
            filter: isHero ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' : undefined,
          }}
        />
      }
      label={label}
      size={size}
      sx={{
        fontWeight: 700,
        fontSize: isSmall ? '0.75rem' : '0.8125rem',
        letterSpacing: '0.02em',
        borderRadius: 2,
        px: 0.5,
        height: isSmall ? 28 : 32,
        ...(isHero
          ? {
              background:
                'linear-gradient(135deg, rgba(234, 88, 12, 0.3) 0%, rgba(194, 65, 12, 0.45) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(251, 146, 60, 0.65)',
              color: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
            }
          : {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(234, 88, 12, 0.2)'
                  : 'rgba(230, 81, 0, 0.08)',
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#FED7AA' : 'mission.dark',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(251, 146, 60, 0.45)'
                  : 'rgba(230, 81, 0, 0.28)',
            }),
        ...sx,
      }}
    />
  );
}

