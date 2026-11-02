'use client';

import type { ReactNode } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

type AudienceCardProps = {
  label: string;
  title: string;
  benefit: string;
  accentColor: 'primary.main' | 'supporter.main' | 'connection.main';
  icon?: string;
  layout?: 'card' | 'row';
  header?: ReactNode;
};

function AudienceContent({
  label,
  benefit,
  icon,
}: Pick<AudienceCardProps, 'label' | 'benefit' | 'icon'>) {
  return (
    <Stack
      direction="row"
      spacing={{ xs: 1.5, md: 2 }}
      sx={{
        alignItems: 'flex-start',
        width: '100%',
        minWidth: 0,
      }}
    >
      {icon ? (
        <Image
          src={icon}
          alt=""
          width={80}
          height={80}
          style={{ width: 80, height: 80, objectFit: 'contain', flexShrink: 0 }}
        />
      ) : null}

      <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h4" sx={{ lineHeight: 1.2, fontSize: { xs: '1.5rem', md: '2rem' } }}>
          {label}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.9375rem', md: '1rem' } }}
        >
          {benefit}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default function AudienceCard({
  label,
  benefit,
  accentColor,
  icon,
  layout = 'card',
  header,
}: AudienceCardProps) {
  const content = (
    <Stack spacing={header ? { xs: 3, md: 4 } : 0} sx={{ width: '100%', minWidth: 0 }}>
      {header}
      <AudienceContent label={label} benefit={benefit} icon={icon} />
    </Stack>
  );

  if (layout === 'row') {
    return content;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        height: '100%',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          borderColor: accentColor,
          boxShadow: 'var(--app-shadow-overlay)',
        },
      }}
    >
      {content}
    </Paper>
  );
}
