'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

type AudienceCardProps = {
  label: string;
  title: string;
  benefit: string;
  accentColor: 'primary.main' | 'supporter.main' | 'connection.main';
  mockupVariant: 'missionary' | 'supporter';
  icon?: string;
  layout?: 'card' | 'row';
  imagePosition?: 'left' | 'right';
  header?: ReactNode;
};
function PhoneMockup({ variant }: { variant: 'missionary' | 'supporter' }) {
  const isMissionary = variant === 'missionary';

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 220,
      }}
    >
      {' '}
      <Box
        sx={{
          borderRadius: 4,
          border: '3px solid',
          borderColor: isMissionary ? 'primary.main' : 'supporter.main',
          bgcolor: isMissionary ? 'primary.dark' : 'supporter.dark',
          p: 1.5,
          aspectRatio: '9/16',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box
          sx={{
            height: 8,
            width: '40%',
            borderRadius: 999,
            bgcolor: 'rgba(255,255,255,0.35)',
            mx: 'auto',
          }}
        />
        <Box sx={{ flex: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.12)' }} />
        <Box
          sx={{ height: 10, width: '70%', borderRadius: 999, bgcolor: 'rgba(255,255,255,0.25)' }}
        />
        <Box
          sx={{ height: 10, width: '55%', borderRadius: 999, bgcolor: 'rgba(255,255,255,0.18)' }}
        />
      </Box>
    </Box>
  );
}

function AudienceContent({
  label,
  benefit,
  icon,
}: Pick<AudienceCardProps, "label" | "benefit" | "icon">) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: "flex-start",
        flex: 1,
        minWidth: 0,
        pt: { xs: 0, md: 6, lg: 10 },
      }}
    >
      {icon ? (
        <Image
          src={icon}
          alt=""
          width={80}
          height={80}
          style={{ width: 80, height: 80, objectFit: "contain", flexShrink: 0 }}
        />
      ) : null}

      <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h4" sx={{ lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {benefit}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default function AudienceCard({
  label,
  title: _title,
  benefit,
  accentColor,
  mockupVariant,
  icon,
  layout = 'card',
  imagePosition = 'right',
  header,
}: AudienceCardProps) {
  if (layout === 'row') {
    const imageOnLeft = imagePosition === 'left';

    return (
      <Stack
        spacing={{ xs: 4, md: 6 }}
        sx={{
          alignItems: { xs: "center", md: "flex-start" },
          flexDirection: {
            xs: "column",
            md: imageOnLeft ? "row-reverse" : "row",
          },
        }}
      >
        <Stack
          spacing={header ? 4 : 0}
          sx={{ flex: { md: '0 0 46%' }, width: '100%', maxWidth: { md: 540 } }}
        >
          {header}
          <AudienceContent label={label} benefit={benefit} icon={icon} />
        </Stack>

        <Box
          sx={{
            flex: 1,
            width: '100%',
            display: 'flex',
            justifyContent: { xs: 'center', md: imageOnLeft ? 'flex-start' : 'flex-end' },
            alignItems: 'flex-start',
          }}
        >
          <PhoneMockup variant={mockupVariant} />
        </Box>
      </Stack>
    );
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
          boxShadow: '0 12px 40px rgba(13, 43, 92, 0.08)',
        },
      }}
    >
      <PhoneMockup variant={mockupVariant} />
      <AudienceContent label={label} benefit={benefit} icon={icon} />
    </Paper>
  );
}
