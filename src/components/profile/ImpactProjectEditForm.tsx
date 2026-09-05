'use client';

import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CampaignIcon from '@mui/icons-material/Campaign';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import PillButton from '@/components/common/PillButton';
import { getYouTubeEmbedUrl } from '@/components/profile/ImpactProjectCard';
import { impactProjectEditSchema, type ImpactProjectEditFormData } from '@/schemas/content.schema';
import type { ImpactProjectData } from '@/types/profile';

type ImpactProjectEditFormProps = {
  project: ImpactProjectData;
  onSave?: (updatedProject: ImpactProjectData) => void;
};

export default function ImpactProjectEditForm({ project, onSave }: ImpactProjectEditFormProps) {
  const [toastOpen, setToastOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ImpactProjectEditFormData>({
    resolver: zodResolver(impactProjectEditSchema),
    mode: 'onTouched',
    defaultValues: {
      title: project.title || '',
      description: project.description || '',
      bannerUrl: project.bannerUrl || project.imageUrl || '',
      videoUrl: project.videoUrl || project.youtubeUrl || '',
      galleryImages: project.galleryImages ?? project.images ?? [],
    },
  });

  const [bannerUrl, videoUrl, galleryImages] = watch(['bannerUrl', 'videoUrl', 'galleryImages']);

  const isLinkedWithCampaign = Boolean(project.campaignBadge && project.campaignTitle);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl || '');

  const handleBannerFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setValue('bannerUrl', previewUrl, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleGalleryFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        newUrls.push(URL.createObjectURL(files[i]));
      }
      setValue('galleryImages', [...(galleryImages || []), ...newUrls], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setValue(
      'galleryImages',
      (galleryImages || []).filter((_, idx) => idx !== indexToRemove),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const onSubmit = (data: ImpactProjectEditFormData) => {
    const updated: ImpactProjectData = {
      ...project,
      title: data.title,
      description: data.description,
      imageUrl: data.bannerUrl,
      bannerUrl: data.bannerUrl,
      videoUrl: data.videoUrl.trim() ? data.videoUrl.trim() : undefined,
      youtubeUrl: data.videoUrl.trim() ? data.videoUrl.trim() : undefined,
      galleryImages: data.galleryImages,
    };
    onSave?.(updated);
    setToastOpen(true);
  };

  return (
    <>
      <Card
        component="section"
        elevation={0}
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 3px 8px rgba(13, 43, 92, 0.16)',
          bgcolor: 'background.paper',
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
          }}
        >
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={{ xs: 3, sm: 4 }}>
              {/* Cabeçalho */}
              <Box>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                  Editar Projeto de Impacto
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Envie fotos do seu dispositivo, personalize a capa, descrição e o vídeo de
                  apresentação do seu projeto.
                </Typography>
              </Box>

              {/* 1. Imagem de Capa / Banner Principal */}
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Imagem de Capa (Banner)
                </Typography>

                {bannerUrl ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: { xs: 180, sm: 240, md: 280 },
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 1,
                    }}
                  >
                    <Image
                      src={bannerUrl}
                      alt="Prévia da capa do projeto"
                      fill
                      sizes="(max-width: 600px) 100vw, 800px"
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: 140, sm: 180 },
                      borderRadius: 2,
                      border: '2px dashed',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma imagem de capa selecionada.
                    </Typography>
                  </Box>
                )}

                <Box>
                  <PillButton
                    component="label"
                    tone="primarySoftOutline"
                    size="small"
                    sx={{
                      minHeight: 44,
                      px: 2.5,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      width: { xs: '100%', sm: 'auto' },
                      justifyContent: 'center',
                    }}
                  >
                    <CloudUploadOutlinedIcon sx={{ fontSize: 20, mr: 1 }} />
                    {bannerUrl ? 'Alterar foto de capa' : 'Selecionar foto de capa'}
                    <Box
                      component="input"
                      type="file"
                      accept="image/*"
                      aria-label="Upload de foto de capa"
                      hidden
                      onChange={handleBannerFileChange}
                    />
                  </PillButton>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.75 }}
                  >
                    Selecione uma imagem do seu dispositivo (JPG, PNG, WebP)
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              {/* 2. Informações Principais */}
              <Stack spacing={2.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Informações Básicas
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
                    placeholder="Ex: Projeto Social na África do Sul"
                  />
                </Stack>

                <Stack spacing={0.75}>
                  <Typography
                    component="label"
                    htmlFor="project-description"
                    variant="body2"
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    Descrição Detalhada:
                  </Typography>
                  <TextField
                    id="project-description"
                    {...register('description')}
                    multiline
                    minRows={4}
                    fullWidth
                    error={Boolean(errors.description)}
                    helperText={errors.description?.message}
                    placeholder="Conte sobre o objetivo, público alcançado e necessidades do projeto..."
                  />
                </Stack>
              </Stack>

              <Divider />

              {/* 3. Campanha Vinculada (Controlada pelo Backend / Administração - RF 13.2 / 18.4) */}
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
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}
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
                            bgcolor: 'mission.main',
                            color: 'common.white',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        />
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, color: 'primary.main' }}
                        >
                          {project.campaignTitle}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        Este projeto de impacto está associado a uma campanha oficial da plataforma.
                        O vínculo e o selo de &quot;Campanha Ativa&quot; são gerenciados pela
                        administração e sincronizados automaticamente através do backend.
                      </Typography>
                    </Stack>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(13, 43, 92, 0.03)',
                      border: '1px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InfoOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography
                          variant="subtitle2"
                          color="primary.main"
                          sx={{ fontWeight: 700 }}
                        >
                          Aguardando integração com o backend
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        O status de &quot;Campanha Ativa&quot; será exibido automaticamente neste
                        projeto assim que ele for vinculado a uma campanha oficial no backend.
                        Vínculos e selos são gerenciados exclusivamente por administradores e
                        avaliadores da plataforma.
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Stack>

              <Divider />

              {/* 4. Vídeo do YouTube (Opcional - Suporta URL) */}
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <PlayCircleOutlinedIcon sx={{ fontSize: 20, color: 'mission.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Vídeo de Apresentação (YouTube)
                  </Typography>
                </Stack>

                <TextField
                  id="project-youtube-url"
                  label="Link do Vídeo no YouTube"
                  {...register('videoUrl')}
                  placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                  fullWidth
                  size="small"
                  error={Boolean(errors.videoUrl)}
                  helperText={
                    errors.videoUrl?.message ||
                    'Cole o link completo de um vídeo normal, Shorts ou embed do YouTube'
                  }
                />

                {youtubeEmbedUrl && (
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
                        src={youtubeEmbedUrl}
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

              <Divider />

              {/* 5. Galeria de Fotos do Carrossel (Upload do Dispositivo) */}
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <CollectionsOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      Fotos da Galeria ({galleryImages.length})
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Exibidas no carrossel e lightbox
                  </Typography>
                </Stack>

                {/* Lista de Miniaturas da Galeria */}
                {galleryImages.length > 0 ? (
                  <Stack
                    direction="row"
                    spacing={1.5}
                    useFlexGap
                    sx={{ flexWrap: 'wrap', alignItems: 'center' }}
                  >
                    {galleryImages.map((imgUrl, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          width: { xs: 90, sm: 110 },
                          height: { xs: 70, sm: 80 },
                          borderRadius: 1.5,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: 1,
                        }}
                      >
                        <Image
                          src={imgUrl}
                          alt={`Foto da galeria ${index + 1}`}
                          fill
                          sizes="110px"
                          style={{ objectFit: 'cover' }}
                        />
                        <IconButton
                          aria-label={`Remover foto ${index + 1} da galeria`}
                          size="small"
                          onClick={() => handleRemoveGalleryImage(index)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                            color: 'common.white',
                            p: 0.5,
                            '&:hover': { bgcolor: 'error.main' },
                          }}
                        >
                          <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma foto na galeria. Clique no botão abaixo para selecionar fotos do seu
                    computador ou celular.
                  </Typography>
                )}

                {/* Botão para Fazer Upload de Fotos do Dispositivo */}
                <Box>
                  <PillButton
                    component="label"
                    tone="primarySoftOutline"
                    size="small"
                    sx={{
                      minHeight: 44,
                      px: 2.5,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      width: { xs: '100%', sm: 'auto' },
                      justifyContent: 'center',
                    }}
                  >
                    <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 20, mr: 1 }} />
                    Adicionar fotos do dispositivo
                    <Box
                      component="input"
                      type="file"
                      accept="image/*"
                      multiple
                      aria-label="Upload de fotos da galeria"
                      hidden
                      onChange={handleGalleryFilesChange}
                    />
                  </PillButton>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.75 }}
                  >
                    Você pode selecionar uma ou várias imagens ao mesmo tempo do seu dispositivo
                  </Typography>
                </Box>
              </Stack>

              {/* Ações Finais */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  justifyContent: 'flex-end',
                  pt: { xs: 1, sm: 2 },
                  '& .MuiButton-root': { flex: { xs: 1, sm: 'initial' } },
                }}
              >
                <PillButton
                  href="/profile/projetos-de-impacto"
                  tone="primarySoftOutline"
                  size="small"
                >
                  Voltar
                </PillButton>
                <PillButton type="submit" tone="primaryFilled" size="small">
                  Salvar
                </PillButton>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Feedback Toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          variant="filled"
          role="status"
          aria-live="polite"
          sx={{
            bgcolor: 'primary.main',
            color: 'common.white',
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: 3,
            '& .MuiAlert-icon': {
              color: 'common.white',
            },
          }}
        >
          Projeto de impacto atualizado com sucesso!
        </Alert>
      </Snackbar>
    </>
  );
}
