'use client';

import Image from 'next/image';
import { useState, type FormEvent, type SyntheticEvent } from 'react';
import AddIcon from '@mui/icons-material/Add';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PersonIcon from '@mui/icons-material/Person';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import { mockProfile } from '@/mocks/profile';

type FeedView = 'mine' | 'general';

const cardSx = {
  borderRadius: { xs: 2, sm: 3 },
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 1,
} as const;

function NewPostForm({ onCancel }: { onCancel?: () => void }) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCancel?.();
  };

  return (
    <Card component="section" elevation={0} sx={cardSx}>
      <CardContent
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="primary.main">
              Nova postagem
            </Typography>

            <TextField
              multiline
              minRows={6}
              fullWidth
              placeholder="Comece a escrever..."
              aria-label="Conteúdo da nova postagem"
            />

            <Stack spacing={0.75}>
              <Typography
                component="label"
                htmlFor="post-youtube-link"
                variant="body2"
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Link para o YouTube:
              </Typography>
              <TextField
                id="post-youtube-link"
                type="url"
                size="small"
                fullWidth
                placeholder="www.youtube.com/..."
              />
            </Stack>

            <Box>
              <PillButton component="label" tone="primarySoftOutline" size="small">
                <ImageOutlinedIcon sx={{ mr: 0.75, fontSize: 17 }} />
                Inserir imagens
                <Box component="input" type="file" accept="image/*" multiple hidden />
              </PillButton>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'flex-end', pt: { xs: 2, sm: 6 } }}
            >
              <PillButton tone="primarySoftOutline" size="small" type="button" onClick={onCancel}>
                Cancelar
              </PillButton>
              <PillButton tone="primaryFilled" size="small" type="submit">
                Postar
              </PillButton>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

function FeedNavigation({
  value,
  onChange,
}: {
  value: FeedView;
  onChange: (value: FeedView) => void;
}) {
  const handleChange = (_event: SyntheticEvent, nextValue: FeedView) => {
    onChange(nextValue);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 1,
        overflow: 'hidden',
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        variant="fullWidth"
        aria-label="Filtros de postagens"
        sx={{
          minHeight: 44,
          '& .MuiTabs-indicator': { height: 3, bgcolor: 'mission.main' },
          '& .MuiTab-root': {
            minHeight: 44,
            color: 'primary.main',
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            fontWeight: 700,
          },
          '& .Mui-selected': { color: 'mission.main' },
        }}
      >
        <Tab value="mine" label="Meu feed" disableRipple />
        <Tab value="general" label="Geral" disableRipple />
      </Tabs>
    </Paper>
  );
}

function PostAuthor() {
  return (
    <>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'supporter.light',
            color: 'common.black',
            border: '1px solid',
            borderColor: 'primary.main',
          }}
        >
          <PersonIcon sx={{ fontSize: 23 }} />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {mockProfile.displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{mockProfile.username}
            </Typography>
          </Stack>
          <Typography component="time" dateTime="2025-07-10T22:06:00" variant="caption">
            10/07/2025 às 22:06h
          </Typography>
        </Box>
      </Stack>
      <Divider />
    </>
  );
}

function PostCard({ showAuthor }: { showAuthor: boolean }) {
  return (
    <Card component="article" elevation={0} sx={cardSx}>
      <CardContent
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
        }}
      >
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          {showAuthor ? (
            <PostAuthor />
          ) : (
            <Typography component="time" dateTime="2025-07-10T22:06:00" variant="caption">
              10/07/2025 às 22:06h
            </Typography>
          )}

          <Typography variant="body2">
            Hoje, fizemos uma leitura bíblica com as crianças sobre a vida de Jesus. Ensinamos a
            elas como manusear a Bíblia e a diferença entre o novo e velho Testamento.
          </Typography>

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: { sm: 640 },
              aspectRatio: '4 / 3',
              alignSelf: 'center',
              overflow: 'hidden',
              borderRadius: 1,
              bgcolor: 'surface.main',
            }}
          >
            <Image
              src="/landing-page/landing-page.png"
              alt="Encontro de atuação missionária com crianças"
              fill
              preload
              sizes="(max-width: 600px) 100vw, 640px"
              style={{ objectFit: 'cover' }}
            />
          </Box>

          <Stack direction="row" spacing={1.5}>
            <IconButton aria-label="Curtir postagem" color="primary">
              <FavoriteBorderOutlinedIcon />
            </IconButton>
            <IconButton aria-label="Salvar postagem" color="primary">
              <BookmarkBorderOutlinedIcon />
            </IconButton>
            <IconButton aria-label="Compartilhar postagem" color="primary">
              <ShareOutlinedIcon />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ProfilePostsPage() {
  const [feedView, setFeedView] = useState<FeedView>('mine');
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  return (
    <Stack spacing={{ xs: 2, sm: 3 }}>
      {isCreatingPost ? (
        <NewPostForm onCancel={() => setIsCreatingPost(false)} />
      ) : (
        <PillButton
          tone="primaryFilled"
          size="large"
          onClick={() => setIsCreatingPost(true)}
          sx={{
            width: '100%',
            minHeight: { xs: 44, sm: 48 },
            borderRadius: { xs: 2, sm: 3 },
            fontWeight: 700,
            fontSize: { xs: '0.9375rem', sm: '1rem' },
            boxShadow: '0 2px 8px rgba(13, 43, 92, 0.25)',
          }}
        >
          <AddIcon sx={{ fontSize: 20, mr: 1 }} />
          Postar
        </PillButton>
      )}

      <FeedNavigation value={feedView} onChange={setFeedView} />
      <PostCard showAuthor={feedView === 'general'} />
    </Stack>
  );
}
