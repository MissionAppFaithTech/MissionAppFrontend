'use client';

import { useState, type FormEvent } from 'react';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import PillButton from '@/components/common/PillButton';
import { getYouTubeEmbedUrl } from '@/components/profile/ImpactProjectCard';
import type { ImpactProjectData } from '@/types/profile';

type ImpactProjectEditFormProps = {
  project: ImpactProjectData;
  onSave?: (updatedProject: ImpactProjectData) => void;
};

export default function ImpactProjectEditForm({ project, onSave }: ImpactProjectEditFormProps) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [bannerUrl, setBannerUrl] = useState(project.bannerUrl || project.imageUrl);
  const [campaignTitle, setCampaignTitle] = useState(project.campaignTitle || '');
  const [campaignBadge, setCampaignBadge] = useState(Boolean(project.campaignBadge));
  const [videoUrl, setVideoUrl] = useState(project.videoUrl || project.youtubeUrl || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(
    project.galleryImages ?? project.images ?? []
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);

  const handleAddGalleryImage = () => {
    const trimmed = newImageUrl.trim();
    if (trimmed && !galleryImages.includes(trimmed)) {
      setGalleryImages((prev) => [...prev, trimmed]);
      setNewImageUrl('');
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updated: ImpactProjectData = {
      ...project,
      title,
      description,
      imageUrl: bannerUrl,
      bannerUrl,
      campaignTitle: campaignTitle.trim() ? campaignTitle.trim() : undefined,
      campaignBadge,
      videoUrl: videoUrl.trim() ? videoUrl.trim() : undefined,
      youtubeUrl: videoUrl.trim() ? videoUrl.trim() : undefined,
      galleryImages,
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
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={{ xs: 3, sm: 4 }}>
              {/* Cabeçalho */}
              <Box>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                  Editar Projeto de Impacto
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Atualize as informações, fotos da galeria, capa e vídeo de apresentação do seu
                  projeto.
                </Typography>
              </Box>

              {/* 1. Imagem de Capa / Banner Principal */}
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Imagem de Capa (Banner)
                </Typography>

                {bannerUrl && (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: { xs: 180, sm: 240 },
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
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
                )}

                <TextField
                  id="project-banner-url"
                  label="URL da Imagem de Capa"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg ou /images/projects/..."
                  fullWidth
                  size="small"
                  helperText="Insira uma URL pública ou caminho local para o banner principal"
                />
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
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    fullWidth
                    size="small"
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
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    multiline
                    minRows={4}
                    fullWidth
                    placeholder="Conte sobre o objetivo, público alcançado e necessidades do projeto..."
                  />
                </Stack>
              </Stack>

              <Divider />

              {/* 3. Campanha Vinculada */}
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Campanha Vinculada
                </Typography>

                <Stack spacing={0.75}>
                  <Typography
                    component="label"
                    htmlFor="project-campaign-title"
                    variant="body2"
                    sx={{ color: 'primary.main', fontWeight: 600 }}
                  >
                    Título da Campanha (Opcional):
                  </Typography>
                  <TextField
                    id="project-campaign-title"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="Ex: Campanha de Educação & Esperança"
                  />
                </Stack>

                <FormControlLabel
                  control={
                    <Switch
                      checked={campaignBadge}
                      onChange={(e) => setCampaignBadge(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Exibir selo de &quot;Campanha Ativa&quot; no card do projeto
                    </Typography>
                  }
                />
              </Stack>

              <Divider />

              {/* 4. Vídeo do YouTube (Opcional) */}
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <PlayCircleOutlinedIcon sx={{ fontSize: 20, color: 'mission.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Vídeo de Apresentação (YouTube)
                  </Typography>
                </Stack>

                <TextField
                  id="project-video-url"
                  label="Link do Vídeo no YouTube"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                  fullWidth
                  size="small"
                  helperText="Cole o link completo de um vídeo normal, Shorts ou embed do YouTube"
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

              {/* 5. Galeria de Fotos do Carrossel */}
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
                    Nenhuma foto adicional na galeria. Adicione URLs abaixo.
                  </Typography>
                )}

                {/* Input para Adicionar Nova Foto */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    id="new-gallery-image"
                    label="URL da nova foto"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/foto.jpg ou /landing-page/..."
                    fullWidth
                    size="small"
                  />
                  <PillButton
                    type="button"
                    tone="primarySoftOutline"
                    size="small"
                    onClick={handleAddGalleryImage}
                    disabled={!newImageUrl.trim()}
                    sx={{ minHeight: 40, whiteSpace: 'nowrap' }}
                  >
                    <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                    Adicionar Foto
                  </PillButton>
                </Stack>
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
