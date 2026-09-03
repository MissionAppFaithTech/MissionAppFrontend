'use client';

import Image from 'next/image';
import { useState } from 'react';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import PersonIcon from '@mui/icons-material/Person';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import type { SavedPost } from '@/types/profile';

type SavedPostsSectionProps = {
  posts: SavedPost[];
};

export default function SavedPostsSection({ posts }: SavedPostsSectionProps) {
  const [prayedPosts, setPrayedPosts] = useState<
    Record<string, { count: number; active: boolean }>
  >(() => {
    const initial: Record<string, { count: number; active: boolean }> = {};
    posts.forEach((p) => {
      initial[p.id] = { count: p.prayersCount ?? 0, active: !!p.hasPrayed };
    });
    return initial;
  });

  const togglePrayer = (id: string) => {
    setPrayedPosts((prev) => {
      const current = prev[id] || { count: 0, active: false };
      return {
        ...prev,
        [id]: {
          count: current.active ? current.count - 1 : current.count + 1,
          active: !current.active,
        },
      };
    });
  };

  return (
    <Stack spacing={{ xs: 2, sm: 2.5 }}>
      {posts.map((post) => {
        const prayerState = prayedPosts[post.id] || {
          count: post.prayersCount ?? 0,
          active: !!post.hasPrayed,
        };

        return (
          <Card
            key={post.id}
            component="article"
            elevation={0}
            sx={{
              borderRadius: { xs: 2, sm: 3 },
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 3px 8px rgba(13, 43, 92, 0.14)',
              bgcolor: 'background.paper',
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2, sm: 3, md: 3.5 },
                '&:last-child': { pb: { xs: 2, sm: 3, md: 3.5 } },
              }}
            >
              <Stack spacing={{ xs: 1.75, sm: 2 }}>
                {/* Header: Author info + Badge */}
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <Avatar
                      sx={{
                        width: { xs: 44, sm: 48 },
                        height: { xs: 44, sm: 48 },
                        bgcolor: 'supporter.light',
                        color: 'common.black',
                        border: '1.5px solid',
                        borderColor: 'divider',
                        flexShrink: 0,
                      }}
                    >
                      <PersonIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.primary"
                        sx={{ fontWeight: 700, lineHeight: 1.2 }}
                      >
                        {post.authorName}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
                      >
                        {post.createdAt}
                      </Typography>
                    </Box>
                  </Stack>

                  {post.type === 'prayer' ? (
                    <Chip
                      label="ORAÇÃO"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(234, 241, 250, 0.85)',
                        color: 'primary.main',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        letterSpacing: '0.05em',
                        borderRadius: 1.5,
                        px: 0.5,
                      }}
                    />
                  ) : post.type === 'campaign' ? (
                    <Chip
                      label="NOVA CAMPANHA"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(254, 243, 199, 0.9)',
                        color: 'warning.dark',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        letterSpacing: '0.05em',
                        borderRadius: 1.5,
                        px: 0.5,
                      }}
                    />
                  ) : (
                    <Chip
                      label="ATUALIZAÇÃO"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(234, 241, 250, 0.85)',
                        color: 'primary.main',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        letterSpacing: '0.05em',
                        borderRadius: 1.5,
                        px: 0.5,
                      }}
                    />
                  )}
                </Stack>

                {/* Content */}
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    lineHeight: 1.6,
                  }}
                >
                  {post.content}
                </Typography>

                {/* Optional Image */}
                {post.imageUrl ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: { sm: 640 },
                      aspectRatio: '16 / 10',
                      alignSelf: 'center',
                      overflow: 'hidden',
                      borderRadius: 2,
                      bgcolor: 'surface.main',
                    }}
                  >
                    <Image
                      src={post.imageUrl}
                      alt="Imagem da postagem"
                      fill
                      preload
                      sizes="(max-width: 600px) 100vw, 640px"
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                ) : null}

                {/* Footer Action Bar matching Photo 091212.png */}
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: 'center',
                    justify: 'space-between',
                    pt: 0.5,
                  }}
                >
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <IconButton aria-label="Curtir postagem" size="small" color="primary">
                      <FavoriteBorderOutlinedIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mr: 1, minWidth: 20 }}
                    >
                      {post.likesCount ?? 0}
                    </Typography>

                    <IconButton aria-label="Postagem salva" size="small" color="primary">
                      <BookmarkIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    </IconButton>

                    <IconButton aria-label="Compartilhar" size="small" color="primary">
                      <ShareOutlinedIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Stack>

                  {/* Prayer Action Button "Orei · count" */}
                  <PillButton
                    tone={prayerState.active ? 'cta' : 'primarySoftOutline'}
                    size="small"
                    onClick={() => togglePrayer(post.id)}
                    sx={{
                      px: { xs: 1.75, sm: 2.25 },
                      py: 0.5,
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      fontWeight: 600,
                      borderColor: 'primary.main',
                    }}
                  >
                    Orei · {prayerState.count}
                  </PillButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
