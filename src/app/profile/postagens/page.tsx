'use client';

import Image from 'next/image';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';

const cardSx = {
  borderRadius: { xs: 2, sm: 3 },
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 1,
} as const;

export default function ProfilePostsPage() {
  return (
    <Stack spacing={{ xs: 2, sm: 3 }}>
      <Card component="section" elevation={0} sx={cardSx}>
        <CardContent
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
          }}
        >
          <Box component="form">
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
                <PillButton tone="primarySoftOutline" size="small" type="reset">
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

      <Card component="article" elevation={0} sx={cardSx}>
        <CardContent
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
          }}
        >
          <Stack spacing={{ xs: 2, sm: 2.5 }}>
            <Typography component="time" dateTime="2025-07-10T22:06:00" variant="caption">
              10/07/2025 às 22:06h
            </Typography>

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
    </Stack>
  );
}
