'use client';

import Image from 'next/image';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
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
import LockedContentNotice from '@/components/common/LockedContentNotice';
import PillButton from '@/components/common/PillButton';
import type { SavedPost } from '@/types/profile';

type VisitorProfilePostsSectionProps = {
  posts: SavedPost[];
};

export default function VisitorProfilePostsSection({ posts }: VisitorProfilePostsSectionProps) {
  return (
    <Stack spacing={{ xs: 2, sm: 2.5 }}>
      {posts.map((post) => (
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
              {/* Header: Autor + Badge */}
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

                <Chip
                  label={
                    post.type === 'prayer'
                      ? 'ORAÇÃO'
                      : post.type === 'campaign'
                        ? 'CAMPANHA'
                        : 'ATUALIZAÇÃO'
                  }
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
              </Stack>

              {/* Conteúdo */}
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

              {/* Imagem opcional */}
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
                    sizes="(max-width: 600px) 100vw, 640px"
                    style={{ objectFit: 'cover' }}
                  />
                </Box>
              ) : null}

              {/* Barra de Ações com redirecionamento de login para visitante */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pt: 0.5,
                }}
              >
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <IconButton
                    component="a"
                    href="/select-role"
                    aria-label="Curtir postagem (necessário login)"
                    size="small"
                    color="primary"
                  >
                    <FavoriteBorderOutlinedIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 600, mr: 1, minWidth: 20 }}
                  >
                    {post.likesCount ?? 0}
                  </Typography>

                  <IconButton
                    component="a"
                    href="/select-role"
                    aria-label="Salvar postagem (necessário login)"
                    size="small"
                    color="primary"
                  >
                    <BookmarkBorderOutlinedIcon sx={{ fontSize: 20 }} />
                  </IconButton>

                  <IconButton
                    aria-label="Compartilhar"
                    size="small"
                    color="primary"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                  >
                    <ShareOutlinedIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Stack>

                <PillButton
                  href="/select-role"
                  tone="primarySoftOutline"
                  size="small"
                  sx={{
                    px: { xs: 1.75, sm: 2.25 },
                    py: 0.5,
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    fontWeight: 600,
                    borderColor: 'primary.main',
                  }}
                >
                  Orei · {post.prayersCount ?? 0}
                </PillButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}

      <LockedContentNotice
        title="Veja todas as postagens e orações"
        description="Junte-se à comunidade para interagir, orar em tempo real e acompanhar os testemunhos da missão."
      />
    </Stack>
  );
}
