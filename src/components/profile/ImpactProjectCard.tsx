'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Lightbox from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import PillButton from '@/components/common/PillButton';
import DonationModal from '@/components/profile/DonationModal';
import getYouTubeId from 'get-youtube-id';
import type { ImpactProjectData } from '@/types/profile';

import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';

type ImpactProjectCardProps = {
  project?: ImpactProjectData;
  isOwnProfile?: boolean;
  missionaryName?: string;
  onEdit?: () => void;
};

export function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const videoId = getYouTubeId(url.trim());
  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }
  return null;
}

const defaultProject: ImpactProjectData = {
  id: 'proj-1',
  title: 'Projeto social na favela do Lixão',
  description:
    'Ajude-nos a construir uma escola cristã em uma favela da África do Sul. Neste lugar, as crianças quase não tem acesso a materiais educativos cristãos. Ter uma escola confessional cristã em lugar tão carente pode revolucionar uma geração inteira.\n\nPrecisamos de recursos para comprar tijolos, argamassa, cimento, areia, tinta, telhas, carteiras escolares, quadro, mesas, dentre outros.',
  imageUrl: '/images/projects/projeto-impacto.jpg',
  galleryImages: [
    '/landing-page/landing-page.png',
    '/images/projects/projeto-impacto.jpg',
    '/landing-page/background.png',
  ],
  videoUrl: 'https://www.youtube.com/watch?v=5dsGWM5XGdg',
  campaignTitle: 'Campanha de Educação & Esperança',
  campaignBadge: true,
};

export default function ImpactProjectCard({
  project = defaultProject,
  isOwnProfile = true,
  missionaryName = 'Samuel Mendonça',
  onEdit,
}: ImpactProjectCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const bannerImage = project.bannerUrl || project.imageUrl;
  const galleryPhotos = project.galleryImages ?? project.images ?? [];
  const youtubeEmbedUrl = getYouTubeEmbedUrl(project.videoUrl || project.youtubeUrl);

  const handleNextSlide = () => {
    if (galleryPhotos.length > 0) {
      setCarouselIndex((prev) => (prev + 1) % galleryPhotos.length);
    }
  };

  const handlePrevSlide = () => {
    if (galleryPhotos.length > 0) {
      setCarouselIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
    }
  };

  return (
    <>
      <Card
        component="article"
        elevation={0}
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 3px 8px rgba(13, 43, 92, 0.16)',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {/* 1. Imagem de Capa / Banner do Projeto */}
        <Box sx={{ position: 'relative', width: '100%', height: { xs: 200, sm: 280, md: 320 } }}>
          <Image
            src={bannerImage}
            alt={project.title}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 80vw, 70vw"
            priority
            style={{ objectFit: 'cover' }}
          />

          {/* Selos / Badges sobrepostos ao banner */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 12, sm: 16 },
              left: { xs: 12, sm: 16 },
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Chip
              label="Projeto de Impacto"
              size="small"
              sx={{
                bgcolor: 'rgba(13, 43, 92, 0.9)',
                color: 'common.white',
                fontWeight: 700,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                backdropFilter: 'blur(4px)',
              }}
            />
            {project.campaignBadge && (
              <Chip
                label="Campanha Ativa"
                size="small"
                sx={{
                  bgcolor: 'rgba(230, 81, 0, 0.9)',
                  color: 'common.white',
                  fontWeight: 700,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  backdropFilter: 'blur(4px)',
                }}
              />
            )}
          </Box>
        </Box>

        <CardContent
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            '&:last-child': { pb: { xs: 2, sm: 3, md: 4 } },
          }}
        >
          <Stack spacing={{ xs: 2.5, sm: 3 }}>
            {/* 2. Cabeçalho do Card: Título e Kebab Menu */}
            <Stack
              direction="row"
              sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                {project.campaignTitle && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'mission.main',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    {project.campaignTitle}
                  </Typography>
                )}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: 'primary.main',
                    lineHeight: 1.3,
                    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' },
                  }}
                >
                  {project.title}
                </Typography>
              </Box>

              {/* Kebab Menu (3 pontos) */}
              <IconButton
                aria-label="Mais opções do projeto"
                size="small"
                onClick={handleOpenMenu}
                sx={{
                  color: 'text.secondary',
                  minWidth: 44,
                  minHeight: 44,
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Stack>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleCloseMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {isOwnProfile ? (
                <MenuItem
                  component={Link}
                  href="/profile/projetos-de-impacto/edit"
                  onClick={() => {
                    handleCloseMenu();
                    onEdit?.();
                  }}
                >
                  Editar projeto
                </MenuItem>
              ) : (
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    alert('Denúncia recebida para análise da moderação.');
                  }}
                >
                  Denunciar projeto
                </MenuItem>
              )}
            </Menu>

            {/* 3. Descrição do Projeto */}
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                whiteSpace: 'pre-line',
                lineHeight: 1.7,
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              }}
            >
              {project.description}
            </Typography>

            {/* 4. Display de Vídeo do YouTube (Frame Display) */}
            {youtubeEmbedUrl && (
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <PlayCircleOutlinedIcon sx={{ fontSize: 20, color: 'mission.main' }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.875rem' }}
                  >
                    Vídeo de apresentação
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    borderRadius: { xs: 1.5, sm: 2 },
                    overflow: 'hidden',
                    bgcolor: 'common.black',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    component="iframe"
                    src={youtubeEmbedUrl}
                    title={`${project.title} - Vídeo de apresentação`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
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

            {/* 5. Carrossel de Fotos do Projeto */}
            {galleryPhotos.length > 0 && (
              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <CollectionsOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.875rem' }}
                    >
                      Fotos do projeto ({galleryPhotos.length})
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {carouselIndex + 1} de {galleryPhotos.length}
                  </Typography>
                </Stack>

                {/* Container do Carrossel de Fotos */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: { xs: '16 / 10', sm: '16 / 9' },
                    borderRadius: { xs: 2, sm: 2.5 },
                    overflow: 'hidden',
                    bgcolor: 'neutral.900',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 8px rgba(13, 43, 92, 0.08)',
                  }}
                >
                  {/* Foto Ativa do Carrossel (Clicável para abrir visualização completa) */}
                  <Box
                    onClick={() => setLightboxIndex(carouselIndex)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ampliar foto ${carouselIndex + 1} do projeto`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setLightboxIndex(carouselIndex);
                      }
                    }}
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover img': { transform: 'scale(1.03)' },
                      '&:hover .zoom-hint': { opacity: 1 },
                    }}
                  >
                    <Image
                      src={galleryPhotos[carouselIndex]}
                      alt={`${project.title} - Foto ${carouselIndex + 1}`}
                      fill
                      sizes="(max-width: 600px) 100vw, 800px"
                      priority={carouselIndex === 0}
                      style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    />

                    {/* Dica visual de clique para ampliar */}
                    <Box
                      className="zoom-hint"
                      sx={{
                        position: 'absolute',
                        top: { xs: 10, sm: 14 },
                        right: { xs: 10, sm: 14 },
                        bgcolor: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(4px)',
                        color: 'common.white',
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        opacity: { xs: 0.9, sm: 0 },
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      <ZoomInIcon sx={{ fontSize: 16 }} />
                      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        Ampliar
                      </Box>
                    </Box>
                  </Box>

                  {/* Controles de Navegação Anterior / Próximo do Carrossel */}
                  {galleryPhotos.length > 1 && (
                    <>
                      <IconButton
                        aria-label="Foto anterior do carrossel"
                        onClick={handlePrevSlide}
                        sx={{
                          position: 'absolute',
                          left: { xs: 6, sm: 12 },
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 2,
                          color: 'common.white',
                          bgcolor: 'rgba(15, 23, 42, 0.65)',
                          minWidth: 44,
                          minHeight: 44,
                          backdropFilter: 'blur(4px)',
                          '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.9)' },
                        }}
                      >
                        <NavigateBeforeIcon sx={{ fontSize: { xs: 26, sm: 30 } }} />
                      </IconButton>
                      <IconButton
                        aria-label="Foto seguinte do carrossel"
                        onClick={handleNextSlide}
                        sx={{
                          position: 'absolute',
                          right: { xs: 6, sm: 12 },
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 2,
                          color: 'common.white',
                          bgcolor: 'rgba(15, 23, 42, 0.65)',
                          minWidth: 44,
                          minHeight: 44,
                          backdropFilter: 'blur(4px)',
                          '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.9)' },
                        }}
                      >
                        <NavigateNextIcon sx={{ fontSize: { xs: 26, sm: 30 } }} />
                      </IconButton>
                    </>
                  )}
                </Box>

                {/* Indicadores de Paginação / Dots do Carrossel */}
                {galleryPhotos.length > 1 && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: 'center', alignItems: 'center', py: 0.5 }}
                  >
                    {galleryPhotos.map((_, idx) => (
                      <Box
                        key={idx}
                        component="button"
                        type="button"
                        aria-label={`Ir para a foto ${idx + 1}`}
                        onClick={() => setCarouselIndex(idx)}
                        sx={{
                          width: idx === carouselIndex ? 22 : 8,
                          height: 8,
                          borderRadius: 4,
                          border: 'none',
                          p: 0,
                          cursor: 'pointer',
                          bgcolor: idx === carouselIndex ? 'mission.main' : 'divider',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: idx === carouselIndex ? 'mission.dark' : 'text.disabled',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            )}

            {/* 6. Ação de Ofertar */}
            <Box sx={{ pt: 1 }}>
              <PillButton
                tone="missionFilled"
                size="medium"
                onClick={() => setDonationModalOpen(true)}
                sx={{
                  minHeight: 44,
                  width: { xs: '100%', sm: 'auto' },
                  px: 3,
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  bgcolor: 'mission.main',
                  color: 'common.white',
                  '&:hover': { bgcolor: 'mission.dark' },
                  boxShadow: '0 2px 8px rgba(230, 81, 0, 0.25)',
                }}
              >
                <VolunteerActivismIcon sx={{ fontSize: 20, mr: 1 }} />
                Ofertar
              </PillButton>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Visualizador de Fotos em Tela Cheia estilo Instagram / Facebook */}
      <Lightbox
        open={lightboxIndex !== null && lightboxIndex >= 0}
        close={() => setLightboxIndex(null)}
        index={lightboxIndex !== null ? lightboxIndex : 0}
        slides={galleryPhotos.map((src) => ({ src, alt: project.title }))}
        plugins={[Zoom, Counter]}
        animation={{ fade: 250, swipe: 250 }}
        carousel={{ finite: false, padding: '24px', spacing: '24px' }}
        controller={{ closeOnBackdropClick: true }}
        styles={{
          container: { backgroundColor: 'rgba(10, 18, 38, 0.96)' },
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
        }}
        render={{
          buttonPrev: galleryPhotos.length <= 1 ? () => null : undefined,
          buttonNext: galleryPhotos.length <= 1 ? () => null : undefined,
        }}
      />

      {/* Modal de Oferta / Doação */}
      <DonationModal
        open={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        missionaryName={missionaryName}
        isOwnProfile={isOwnProfile}
      />
    </>
  );
}
