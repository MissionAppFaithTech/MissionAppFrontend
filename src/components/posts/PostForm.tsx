'use client';

import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import Image from 'next/image';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import RichTextEditor from '@/components/common/RichTextEditor';
import PillButton from '@/components/common/PillButton';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { ApiError } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/keys';
import {
  createPostSchema,
  updatePostSchema,
  postUploadSchema,
  POST_IMAGE_TYPES,
  type Post,
  type UpdatePostInput,
} from '@/schemas/post.schema';
import {
  createPost,
  updatePost,
  uploadPostImage,
  type PostUploadProgress,
} from '@/services/post.service';
import { useFeedbackStore } from '@/stores/feedbackStore';

type DraftImage = {
  key: string;
  url: string | null;
  file?: File;
  progress: PostUploadProgress;
  state: string;
};
export default function PostForm({ post, onClose }: { post?: Post; onClose: () => void }) {
  const [content, setContent] = useState(post?.content ?? '');
  const [link, setLink] = useState(post?.highlightLink ?? '');
  const [images, setImages] = useState<DraftImage[]>(() =>
    (post?.images ?? [])
      .toSorted((a, b) => a.order - b.order)
      .map(({ imageAssetId, image }) => ({
        key: imageAssetId,
        url: image.url,
        progress: { assetId: imageAssetId, uploaded: true, confirmed: true },
        state:
          image.status === 'READY'
            ? 'Imagem mantida'
            : image.status === 'FAILED'
              ? 'Falha no processamento; remova esta imagem'
              : 'Processando imagem',
      }))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingReplacement, setPendingReplacement] = useState<UpdatePostInput | null>(null);
  const objectUrls = useRef(new Set<string>());
  const fileInput = useRef<HTMLInputElement>(null);
  const submitButton = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  const notify = useFeedbackStore((state) => state.notify);
  const queryClient = useQueryClient();
  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const mutation = useMutation({
    mutationFn: async (replacement?: UpdatePostInput) => {
      let payload = replacement;
      if (!payload) {
        const ids: string[] = [];
        for (const image of images) {
          if (image.file && !image.progress.confirmed) {
            setImages((current) =>
              current.map((entry) =>
                entry.key === image.key ? { ...entry, state: 'Enviando imagem…' } : entry
              )
            );
            try {
              await uploadPostImage(image.file, image.progress);
              setImages((current) =>
                current.map((entry) =>
                  entry.key === image.key
                    ? { ...entry, state: 'Envio confirmado; processando imagem' }
                    : entry
                )
              );
            } catch (error) {
              setImages((current) =>
                current.map((entry) =>
                  entry.key === image.key
                    ? { ...entry, state: 'Falha no envio; tente novamente ou remova' }
                    : entry
                )
              );
              throw error;
            }
          }
          ids.push(image.progress.assetId!);
        }
        payload = {
          content: content.trim(),
          highlightLink: link.trim() || (post ? null : undefined),
          imageAssetIds: ids,
        };
      }
      try {
        return post
          ? await updatePost(post.id, payload)
          : await createPost(createPostSchema.parse(payload));
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.status === 409 &&
          error.code === 'E_POST_IMAGE_LIMIT_REACHED'
        ) {
          // Snapshot the exact attempted payload. Never enable replacement on any other error.
          setPendingReplacement({ ...payload, replaceOldestImages: undefined });
        }
        throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
      notify(post ? 'Postagem atualizada.' : 'Postagem publicada.');
      onClose();
    },
    onError: (error) => {
      if (
        error instanceof ApiError &&
        error.status === 409 &&
        error.code === 'E_POST_IMAGE_LIMIT_REACHED'
      )
        return;
      const message = error instanceof Error ? error.message : 'Não foi possível salvar a postagem';
      setErrors({ ...(error instanceof ApiError ? error.fieldErrors : {}), form: message });
      notify(message, 'error');
      setPendingReplacement(null);
    },
    onSettled: () => {
      busy.current = false;
    },
    retry: false,
  });
  const locked = mutation.isPending || pendingReplacement !== null;

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || locked) return;
    const parsed = (post ? updatePostSchema : createPostSchema).safeParse({
      content,
      highlightLink: link.trim() || (post ? null : undefined),
    });
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fields[String(issue.path[0])] ??= issue.message;
      });
      setErrors(fields);
      document.getElementById(fields.content ? 'post-content' : 'post-link')?.focus();
      return;
    }
    setErrors({});
    busy.current = true;
    mutation.mutate(undefined);
  }
  function selectFiles(files: File[]) {
    if (images.length + files.length > 3) {
      setErrors({ images: 'Escolha até 3 imagens por postagem' });
      return;
    }
    for (const file of files) {
      const valid = postUploadSchema.safeParse({ mimeType: file.type, fileSizeBytes: file.size });
      if (!valid.success) {
        setErrors({ images: valid.error.issues[0].message });
        return;
      }
    }
    const additions = files.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);
      return { key: url, url, file, progress: {}, state: 'Pronta para enviar' };
    });
    setImages((current) => [...current, ...additions]);
    setErrors({});
  }
  function removeImage(image: DraftImage) {
    if (image.url && objectUrls.current.delete(image.url)) URL.revokeObjectURL(image.url);
    setImages((current) => current.filter((entry) => entry.key !== image.key));
  }

  return (
    <Card
      component="section"
      aria-labelledby="post-form-title"
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}
    >
      <Box component="form" noValidate onSubmit={submit} aria-busy={mutation.isPending}>
        <Stack spacing={2} useFlexGap>
          <Typography id="post-form-title" component="h2" variant="h6">
            {post ? 'Editar postagem' : 'Nova postagem'}
          </Typography>
          {errors.form && <Alert severity="error">{errors.form}</Alert>}
          <RichTextEditor
            id="post-content"
            label="Legenda"
            required
            value={content}
            onChange={setContent}
            maxLength={5000}
            disabled={locked}
            minRows={5}
            error={Boolean(errors.content)}
            helperText={errors.content ?? 'Obrigatória. Texto simples, até 5000 caracteres.'}
          />
          <TextField
            id="post-link"
            label="Link opcional"
            type="url"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            disabled={locked}
            error={Boolean(errors.highlightLink)}
            helperText={
              errors.highlightLink ??
              'URL completa. Vídeos do YouTube podem ser incorporados; Shorts, TikTok e Instagram abrem como links.'
            }
            fullWidth
          />
          <Typography id="post-images-help" variant="body2">
            Até 3 imagens JPG, PNG ou WebP, com até 10 MB cada.
          </Typography>
          {errors.images && (
            <Alert id="post-images-error" severity="error">
              {errors.images}
            </Alert>
          )}
          <input
            ref={fileInput}
            type="file"
            multiple
            accept={POST_IMAGE_TYPES.join(',')}
            hidden
            aria-label="Selecionar imagens"
            onChange={(event) => {
              selectFiles(Array.from(event.target.files ?? []));
              event.target.value = '';
            }}
          />
          <PillButton
            tone="primarySoftOutline"
            type="button"
            disabled={locked}
            aria-describedby={errors.images ? 'post-images-error' : 'post-images-help'}
            onClick={() => fileInput.current?.click()}
          >
            Inserir imagens
          </PillButton>
          <Stack component="ul" spacing={2} useFlexGap sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {images.map((image, index) => (
              <Box component="li" key={image.key} sx={{ minWidth: 0 }}>
                {image.url && (
                  <Box sx={{ position: 'relative', aspectRatio: '4 / 3', maxHeight: 240 }}>
                    <Image
                      src={image.url}
                      alt={`Prévia da imagem ${index + 1}`}
                      fill
                      unoptimized
                      sizes="(max-width: 600px) 100vw, 600px"
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                )}
                <Typography role="status" variant="body2">
                  {image.state}
                </Typography>
                <PillButton
                  tone="primarySoftOutline"
                  type="button"
                  disabled={locked}
                  onClick={() => removeImage(image)}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Remover imagem {index + 1}
                </PillButton>
              </Box>
            ))}
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            useFlexGap
            sx={{ '& > button': { width: { xs: '100%', sm: 'auto' }, minHeight: 44 } }}
          >
            <PillButton tone="primarySoftOutline" type="button" onClick={onClose} disabled={locked}>
              Cancelar
            </PillButton>
            <PillButton
              ref={submitButton}
              tone="primaryFilled"
              type="submit"
              loading={mutation.isPending}
              disabled={pendingReplacement !== null}
            >
              {post ? 'Salvar alterações' : 'Publicar'}
            </PillButton>
          </Stack>
        </Stack>
      </Box>
      <ConfirmDialog
        open={pendingReplacement !== null}
        title="Limite de 50 imagens atingido"
        description="Para continuar, as imagens mais antigas das suas postagens serão removidas e substituídas pelas novas. O texto das postagens será preservado. Deseja autorizar a substituição?"
        cancelLabel="Manter imagens antigas"
        confirmLabel="Substituir imagens antigas"
        confirmTone="danger"
        loading={mutation.isPending}
        onCancel={() => setPendingReplacement(null)}
        onExited={() => submitButton.current?.focus()}
        onConfirm={() => {
          if (!pendingReplacement || busy.current) return;
          busy.current = true;
          mutation.mutate({ ...pendingReplacement, replaceOldestImages: true });
        }}
      />
    </Card>
  );
}
