'use client';

import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import getYouTubeId from 'get-youtube-id';

type CampaignVideoPlayerProps = {
  videoUrl?: string;
  title?: string;
};

export function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const videoId = getYouTubeId(url.trim());
  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }
  return null;
}

export default function CampaignVideoPlayer({
  videoUrl,
  title = 'Vídeo da Campanha',
}: CampaignVideoPlayerProps) {
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  if (!embedUrl) {
    return null;
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <PlayCircleOutlinedIcon sx={{ color: 'mission.main', fontSize: 20 }} />
        <Typography
          variant="subtitle2"
          color="primary.main"
          sx={{ fontWeight: 700, fontSize: '0.875rem' }}
        >
          Vídeo Oficial da Campanha
        </Typography>
      </Stack>

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 2.5,
          overflow: 'hidden',
          bgcolor: 'common.black',
          boxShadow: '0 4px 14px rgba(13, 43, 92, 0.12)',
        }}
      >
        <Box
          component="iframe"
          src={embedUrl}
          title={title}
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
    </Stack>
  );
}
