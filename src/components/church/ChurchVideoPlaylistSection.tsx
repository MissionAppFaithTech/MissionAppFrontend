'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PillButton from '@/components/common/PillButton';
import { COUNCIL_PLAYLIST } from './churchGuideData';

export default function ChurchVideoPlaylistSection() {
  return (
    <Box component="section" aria-labelledby="playlist-heading" sx={{ width: '100%' }}>
      <Box sx={{ mb: 3.5, textAlign: 'left' }}>
        <Typography
          id="playlist-heading"
          component="h3"
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 700,
            color: (t) => (t.palette.mode === 'dark' ? 'common.white' : 'primary.main'),
          }}
        >
          {COUNCIL_PLAYLIST.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 800 }}>
          {COUNCIL_PLAYLIST.subtitle}
        </Typography>
      </Box>

      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5, md: 4 },
          borderRadius: 3.5,
          bgcolor: 'background.paper',
          border: (theme) =>
            theme.palette.mode === 'dark'
              ? '1px solid var(--mui-palette-action2-borderSubtle)'
              : '1px solid var(--mui-palette-divider)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark' ? 'none' : '0 4px 20px rgba(13, 43, 92, 0.06)',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ alignItems: 'center' }}>
          {/* Video Player / Playlist Frame */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%', // 16:9 Aspect Ratio
                borderRadius: 2.5,
                overflow: 'hidden',
                bgcolor: 'black',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
              }}
            >
              <Box
                component="iframe"
                src={COUNCIL_PLAYLIST.embedUrl}
                title="Playlist do Curso: Como criar um conselho missionário"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                }}
              />
            </Box>
          </Grid>

          {/* Details & Action */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2.5}>
              <Box>
                <Chip
                  icon={<PlayCircleFilledIcon fontSize="small" />}
                  label="Curso Gratuito no YouTube"
                  size="small"
                  sx={{
                    mb: 1.5,
                    fontWeight: 700,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(194, 65, 12, 0.2)'
                        : 'rgba(194, 65, 12, 0.1)',
                    color: 'accent.main',
                  }}
                />

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6, fontSize: { xs: '0.925rem', sm: '1rem' }, mb: 2 }}
                >
                  {COUNCIL_PLAYLIST.description}
                </Typography>
              </Box>

              {/* Topics list */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'accent.main',
                    mb: 1,
                  }}
                >
                  O que você vai aprender na playlist:
                </Typography>

                <Stack spacing={1}>
                  {COUNCIL_PLAYLIST.topics.map((topic) => (
                    <Stack
                      key={topic}
                      direction="row"
                      spacing={1.25}
                      sx={{ alignItems: 'flex-start' }}
                    >
                      <CheckCircleIcon
                        sx={{ fontSize: 18, color: 'success.main', mt: '2px', flexShrink: 0 }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.875rem',
                          color: (t) =>
                            t.palette.mode === 'dark' ? 'common.white' : 'text.primary',
                          lineHeight: 1.4,
                        }}
                      >
                        {topic}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              {/* Direct YouTube Playlist CTA */}
              <Box sx={{ pt: 1 }}>
                <PillButton
                  href={COUNCIL_PLAYLIST.playlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  tone="missionFilled"
                  endIcon={<OpenInNewIcon fontSize="small" />}
                  aria-label="Assistir Playlist no YouTube (abre em nova aba)"
                  sx={{
                    minHeight: 46,
                    px: 3,
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  Assistir Playlist no YouTube
                </PillButton>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
