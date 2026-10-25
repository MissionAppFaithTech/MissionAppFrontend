'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CampaignIcon from '@mui/icons-material/Campaign';
import { CADENCE_ITEMS, type CadenceItem } from './churchGuideData';

export default function MobilizationTimeline() {
  return (
    <Box component="section" aria-labelledby="timeline-heading" sx={{ width: '100%' }}>
      <Box sx={{ mb: 3.5, textAlign: 'left' }}>
        <Typography
          id="timeline-heading"
          component="h3"
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 700,
            color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
          }}
        >
          Plano Prático de Mobilização Anual da Igreja
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 800 }}>
          Cadência contínua e previsível para manter o coração da congregação batendo pelas nações
          durante as 52 semanas do ano.
        </Typography>
      </Box>

      <Stack spacing={3}>
        {CADENCE_ITEMS.map((item: CadenceItem, index: number) => {
          return (
            <Card
              key={item.id}
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid var(--mui-palette-action2-borderSubtle)'
                    : '1px solid var(--mui-palette-divider)',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark' ? 'none' : '0 2px 12px rgba(13, 43, 92, 0.05)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: 5,
                  bgcolor: index % 2 === 0 ? 'accent.main' : 'primary.main',
                },
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  mb: 1.5,
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(13, 43, 92, 0.06)',
                      color: 'primary.main',
                    }}
                  >
                    {index === 0 ? (
                      <AccessTimeIcon fontSize="small" />
                    ) : index === 3 ? (
                      <CampaignIcon fontSize="small" />
                    ) : (
                      <CalendarMonthIcon fontSize="small" />
                    )}
                  </Box>

                  <Box>
                    <Typography
                      variant="overline"
                      sx={{
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        color: 'accent.main',
                        display: 'block',
                        lineHeight: 1.2,
                      }}
                    >
                      {item.period}
                    </Typography>
                    <Typography
                      component="h4"
                      sx={{
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        fontWeight: 700,
                        color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
                      }}
                    >
                      {item.title}
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  label={item.cadenceBadge}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.12)'
                        : 'rgba(13, 43, 92, 0.08)',
                    color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
                  }}
                />
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, mb: 2, lineHeight: 1.6 }}
              >
                {item.description}
              </Typography>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(13, 43, 92, 0.03)',
                  border: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '1px dashed var(--mui-palette-action2-borderSubtle)'
                      : '1px dashed var(--mui-palette-divider)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontWeight: 700,
                    color: (t) => (t.palette.mode === 'dark' ? 'accent.light' : 'accent.main'),
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 0.5,
                  }}
                >
                  Ação Concreta para a Liderança
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'text.primary'),
                    lineHeight: 1.6,
                  }}
                >
                  {item.actionItem}
                </Typography>
              </Box>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
