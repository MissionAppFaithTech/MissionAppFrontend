'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CampaignIcon from '@mui/icons-material/Campaign';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ImageDropzone from '@/components/common/ImageDropzone';
import PillButton from '@/components/common/PillButton';
import StyledTextArea from '@/components/common/StyledTextArea';
import { ApiError } from '@/lib/api/client';
import { getVideoEmbedUrl } from '@/lib/youtube';
import { impactProjectEditSchema, type ImpactProjectEditFormData } from '@/schemas/content.schema';
import { validateCoverFile } from '@/services/impactProject.service';
import { FORM_ACTION_BUTTON_SX } from '@/theme/theme';
import type { ImpactProjectData } from '@/types/profile';

export type ImpactProjectFormValues = ImpactProjectEditFormData & {
  /** Set only when the user picked a new cover. */
  coverFile?: File;
};

type ImpactProjectEditFormProps = {
  /** Existing project (edit mode); omit to create the missionary's first project. */
  project?: ImpactProjectData | null;
  onSubmit: (values: ImpactProjectFormValues) => Promise<void>;
  /** Offered only when editing an existing project. */
  onDelete?: () => Promise<void>;
};

const FIELD_NAMES = ['title', 'description', 'videoUrl'] as const;

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function ImpactProjectEditForm({
  project,
  onSubmit,
  onDelete,
}: ImpactProjectEditFormProps) {
  const isEditing = Boolean(project);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ImpactProjectEditFormData>({
    resolver: zodResolver(impactProjectEditSchema),
    mode: 'onTouched',
    defaultValues: {
      title: project?.title ?? '',
      description: project?.description ?? '',
      videoUrl: project?.videoUrl ?? '',
    },
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!coverFile) return;
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const videoUrl = watch('videoUrl');
  const videoEmbedUrl = getVideoEmbedUrl(videoUrl);
  const currentCover = coverPreview ?? (project?.imageUrl || null);
  const isLinkedWithCampaign = Boolean(project?.campaignBadge && project?.campaignTitle);

  const handleCoverSelect = (file: File) => {
    const problem = validateCoverFile(file);
    if (problem) {
      setCoverError(problem);
      return;
    }
    setCoverError(null);
    setCoverFile(file);
  };

  const submit = async (data: ImpactProjectEditFormData) => {
    setFormError(null);
    if (!isEditing && !coverFile) {
      setCoverError('Selecione uma foto de capa para o projeto.');
      return;
    }

    try {
      await onSubmit({ ...data, coverFile: coverFile ?? undefined });
    } catch (error) {
      if (error instanceof ApiError) {
        for (const name of FIELD_NAMES) {
          const message = error.fieldErrors[name];
          if (message) setError(name, { type: 'server', message });
        }
        if (error.fieldErrors.coverImageAssetId) setCoverError(error.fieldErrors.coverImageAssetId);
      }
      setFormError(errorMessage(error, 'Não foi possível salvar o projeto de impacto.'));
    }
  };

  const confirmDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await onDelete();
    } catch (error) {
      setDeleteError(errorMessage(error, 'Não foi possível excluir o projeto de impacto.'));
      setDeleting(false);
    }
  };

  return (
    <Card
      component="section"
      aria-labelledby="impact-project-form-title"
      elevation={0}
      sx={{
        borderRadius: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'var(--app-shadow-md)',
        bgcolor: 'background.paper',
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
        }}
      >
        <Box component="form" onSubmit={handleSubmit(submit)} noValidate aria-busy={isSubmitting}>
          <Stack spacing={{ xs: 3, sm: 4 }}>
            <Box>
              <Typography
                id="impact-project-form-title"
                component="h1"
                variant="h6"
                color="primary.main"
                sx={{ fontWeight: 700 }}
              >
                {isEditing ? 'Editar Projeto de Impacto' : 'Criar Projeto de Impacto'}
              </Typography>
            </Box>

            {formError && (
              <Alert severity="error" role="alert">
                {formError}
              </Alert>
            )}

            {/* 1. Imagem de capa (obrigatória) */}
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Imagem de capa (obrigatória)
              </Typography>

              <ImageDropzone
                inputLabel="Upload de foto de capa"
                onSelect={handleCoverSelect}
                previewUrl={currentCover}
                previewAlt="Prévia da capa do projeto"
                emptyTitle="Clique para selecionar a foto de capa"
                changeLabel="Alterar foto de capa"
                emptyNotice={
                  isEditing && project?.coverStatus === 'PROCESSING'
                    ? 'A capa atual ainda está sendo processada.'
                    : undefined
                }
                helperText="JPG, PNG ou WebP, até 10 MB"
                error={coverError}
                disabled={isSubmitting}
              />
            </Stack>

            <Divider />

            {/* 2. Informações principais */}
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Informações básicas
              </Typography>

              <Stack spacing={0.75}>
                <Typography
                  component="label"
                  htmlFor="project-title"
                  variant="body2"
                  sx={{ color: 'primary.main', fontWeight: 600 }}
                >
                  Título do Projeto:
                </Typography>
                <TextField
                  id="project-title"
                  {...register('title')}
                  fullWidth
                  size="small"
                  error={Boolean(errors.title)}
                  helperText={errors.title?.message}
                  placeholder="Ex: Escola na Comunidade"
                  slotProps={{ htmlInput: { maxLength: 255 } }}
                />
              </Stack>

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <StyledTextArea
                    id="project-description"
                    label="Descrição Detalhada"
                    value={field.value}
                    onChange={field.onChange}
                    minRows={5}
                    placeholder="Conte sobre o objetivo, público alcançado, etapas e necessidades do projeto..."
                    error={Boolean(errors.description)}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Stack>

            <Divider />

            {/* 3. Campanha vinculada (gerida pela administração) */}
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CampaignIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Campanha Vinculada
                </Typography>
              </Stack>

              {isLinkedWithCampaign ? (
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(230, 81, 0, 0.04)',
                    border: '1px solid',
                    borderColor: 'rgba(230, 81, 0, 0.25)',
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      useFlexGap
                      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                      <Chip
                        icon={
                          <VerifiedIcon
                            sx={{ fontSize: '16px !important', color: 'common.white !important' }}
                          />
                        }
                        label="Campanha Ativa"
                        size="small"
                        sx={{
                          bgcolor: 'accent.main',
                          color: 'mission.contrastText',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: 'primary.main', minWidth: 0 }}
                      >
                        {project?.campaignTitle}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Este projeto está associado a uma campanha oficial da plataforma. O vínculo e
                      o selo de &quot;Campanha Ativa&quot; são gerenciados pela administração.
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(13, 43, 92, 0.03)',
                    border: '1px dashed',
                    borderColor: 'divider',
                    alignItems: 'flex-start',
                  }}
                >
                  <InfoOutlinedIcon sx={{ color: 'primary.main', fontSize: 20, mt: 0.25 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    O selo de &quot;Campanha Ativa&quot; aparece aqui quando o projeto é vinculado a
                    uma campanha oficial. Vínculos são gerenciados exclusivamente por
                    administradores da plataforma.
                  </Typography>
                </Stack>
              )}
            </Stack>

            <Divider />

            {/* 4. Vídeo (opcional) */}
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <PlayCircleOutlinedIcon sx={{ fontSize: 20, color: 'accent.main' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Vídeo de Apresentação (opcional)
                </Typography>
              </Stack>

              <TextField
                id="project-video-url"
                label="Link do vídeo (YouTube ou Vimeo)"
                {...register('videoUrl')}
                placeholder="https://youtu.be/... ou https://vimeo.com/..."
                fullWidth
                size="small"
                error={Boolean(errors.videoUrl)}
                helperText={
                  errors.videoUrl?.message ||
                  'Apenas links do YouTube ou do Vimeo. Deixe em branco para não exibir vídeo.'
                }
              />

              {videoEmbedUrl && (
                <Stack spacing={1}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Prévia do vídeo incorporado:
                  </Typography>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16 / 9',
                      borderRadius: 2,
                      overflow: 'hidden',
                      bgcolor: 'common.black',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      component="iframe"
                      src={videoEmbedUrl}
                      title="Prévia do vídeo de apresentação"
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
              )}
            </Stack>

            {/* Ações */}
            <Stack
              direction={{ xs: 'column-reverse', sm: 'row' }}
              spacing={1.5}
              useFlexGap
              sx={{
                justifyContent: 'flex-end',
                pt: 2,
                '& .MuiButton-root': {
                  ...FORM_ACTION_BUTTON_SX,
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: 'center',
                },
              }}
            >
              {isEditing && onDelete && (
                <PillButton
                  type="button"
                  tone="outline"
                  size="medium"
                  disabled={isSubmitting}
                  onClick={() => setConfirmingDelete(true)}
                  sx={{ mr: { sm: 'auto' }, color: 'error.main', borderColor: 'error.main' }}
                >
                  Excluir projeto
                </PillButton>
              )}
              <PillButton href="/profile/impact-projects" tone="primarySoftOutline" size="medium">
                Voltar
              </PillButton>
              <PillButton type="submit" tone="primaryFilled" size="medium" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando…' : isEditing ? 'Salvar' : 'Criar projeto'}
              </PillButton>
            </Stack>
          </Stack>
        </Box>
      </CardContent>

      <Dialog
        open={confirmingDelete}
        onClose={() => !deleting && setConfirmingDelete(false)}
        aria-labelledby="delete-impact-project-title"
        aria-describedby="delete-impact-project-description"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="delete-impact-project-title">Excluir projeto de impacto?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-impact-project-description">
            O projeto e a capa serão removidos de forma permanente. Esta ação não pode ser desfeita.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" role="alert" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            gap: 1,
            p: 2,
            '& > :not(style)': { m: 0, width: { xs: '100%', sm: 'auto' } },
          }}
        >
          <PillButton
            type="button"
            tone="primarySoftOutline"
            disabled={deleting}
            onClick={() => setConfirmingDelete(false)}
          >
            Cancelar
          </PillButton>
          <PillButton
            type="button"
            tone="primaryFilled"
            disabled={deleting}
            onClick={confirmDelete}
            sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
          >
            {deleting ? 'Excluindo…' : 'Excluir'}
          </PillButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
