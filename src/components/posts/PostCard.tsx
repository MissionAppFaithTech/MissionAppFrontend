'use client';
import Image from 'next/image';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PillButton from '@/components/common/PillButton';
import { postLink } from '@/lib/postLink';
import { safeWebUrlSchema, type Post } from '@/schemas/post.schema';

export default function PostCard({
  post,
  author,
  onEdit,
  onDelete,
  loading,
  disabled,
}: {
  post: Post;
  author?: { name: string; avatar?: string };
  onEdit?: () => void;
  onDelete?: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const link = postLink(post.highlightLink);
  const [play, setPlay] = useState(false);
  return (
    <Card
      component="article"
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 }, minWidth: 0, overflowWrap: 'anywhere' }}
    >
      <Stack spacing={2} useFlexGap>
        <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', minWidth: 0 }}>
          <Avatar src={author?.avatar} alt="" />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700 }}>{author?.name ?? 'Missionário'}</Typography>
            <Typography variant="caption" component="time" dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleString('pt-BR')}
            </Typography>
          </Box>
        </Stack>
        <Typography sx={{ whiteSpace: 'pre-wrap' }}>{post.content}</Typography>
        {post.images
          .toSorted((a, b) => a.order - b.order)
          .map(({ imageAssetId, image }, index) =>
            image.status === 'READY' && safeWebUrlSchema.safeParse(image.url).success ? (
              <Box key={imageAssetId} sx={{ position: 'relative', aspectRatio: '4 / 3' }}>
                <Image
                  src={image.url!}
                  alt={`Imagem ${index + 1} da postagem`}
                  fill
                  unoptimized
                  sizes="(max-width: 600px) 100vw, 700px"
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            ) : (
              <Typography key={imageAssetId} variant="body2">
                {image.status === 'FAILED'
                  ? 'Não foi possível processar esta imagem.'
                  : 'Imagem em processamento. Ela aparecerá quando estiver pronta.'}
              </Typography>
            )
          )}
        {link && (
          <Link
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 44,
              wordBreak: 'break-word',
            }}
          >
            Abrir link: {link.href}
          </Link>
        )}
        {link?.embed &&
          (play ? (
            <Box
              component="iframe"
              title="Vídeo do YouTube da postagem"
              src={link.embed}
              loading="lazy"
              allow="encrypted-media; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              sx={{ width: '100%', aspectRatio: '16 / 9', border: 0 }}
            />
          ) : (
            <PillButton tone="primarySoftOutline" onClick={() => setPlay(true)}>
              Carregar vídeo do YouTube
            </PillButton>
          ))}
        {onEdit && onDelete && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            useFlexGap
            sx={{ '& > button': { width: { xs: '100%', sm: 'auto' } } }}
          >
            <PillButton
              tone="primarySoftOutline"
              onClick={onEdit}
              loading={loading}
              disabled={disabled}
            >
              Editar postagem
            </PillButton>
            <PillButton tone="primarySoftOutline" onClick={onDelete} disabled={disabled || loading}>
              Excluir postagem
            </PillButton>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
