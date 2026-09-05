'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Lightbox from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';

type CampaignMediaCarouselProps = {
  images: string[];
  title?: string;
  autoPlayInterval?: number;
};

export default function CampaignMediaCarousel({
  images,
  title = 'Campanha',
  autoPlayInterval = 5000,
}: CampaignMediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const total = images.length;

  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [total, isPaused, autoPlayInterval]);

  if (!images || total === 0) {
    return null;
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <Box
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      sx={{ width: '100%' }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: { xs: '16 / 10', sm: '16 / 9' },
          borderRadius: 2.5,
          overflow: 'hidden',
          bgcolor: 'surface.main',
          boxShadow: '0 4px 14px rgba(13, 43, 92, 0.12)',
        }}
      >
        {/* Active Image */}
        <Box
          onClick={() => setLightboxIndex(activeIndex)}
          role="button"
          tabIndex={0}
          aria-label={`Ampliar imagem ${activeIndex + 1} de ${total} da campanha`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setLightboxIndex(activeIndex);
            }
          }}
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            cursor: 'pointer',
            '&:hover img': { transform: 'scale(1.02)' },
            '&:hover .zoom-badge': { opacity: 1 },
          }}
        >
          <Image
            src={images[activeIndex]}
            alt={`${title} - Foto ${activeIndex + 1}`}
            fill
            sizes="(max-width: 600px) 100vw, 850px"
            priority={activeIndex === 0}
            style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
          />

          {/* Indicator Counter Badge */}
          {total > 1 && (
            <Chip
              icon={
                <CollectionsOutlinedIcon
                  sx={{ fontSize: '15px !important', color: 'common.white' }}
                />
              }
              label={`${activeIndex + 1}/${total}`}
              size="small"
              sx={{
                position: 'absolute',
                top: { xs: 10, sm: 14 },
                left: { xs: 10, sm: 14 },
                bgcolor: 'rgba(15, 23, 42, 0.75)',
                color: 'common.white',
                fontWeight: 700,
                fontSize: '0.75rem',
                backdropFilter: 'blur(4px)',
                zIndex: 2,
              }}
            />
          )}

          {/* Zoom hint */}
          <Box
            className="zoom-badge"
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
              zIndex: 2,
            }}
          >
            <ZoomInIcon sx={{ fontSize: 16 }} />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Ampliar
            </Box>
          </Box>
        </Box>

        {/* Carousel Prev/Next Buttons */}
        {total > 1 && (
          <>
            <IconButton
              aria-label="Imagem anterior da campanha"
              onClick={handlePrev}
              sx={{
                position: 'absolute',
                left: { xs: 8, sm: 14 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 3,
                color: 'common.white',
                bgcolor: 'rgba(15, 23, 42, 0.65)',
                minWidth: { xs: 44, sm: 40 },
                minHeight: { xs: 44, sm: 40 },
                backdropFilter: 'blur(4px)',
                '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.9)' },
              }}
            >
              <NavigateBeforeIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
            </IconButton>

            <IconButton
              aria-label="Próxima imagem da campanha"
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: { xs: 8, sm: 14 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 3,
                color: 'common.white',
                bgcolor: 'rgba(15, 23, 42, 0.65)',
                minWidth: { xs: 44, sm: 40 },
                minHeight: { xs: 44, sm: 40 },
                backdropFilter: 'blur(4px)',
                '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.9)' },
              }}
            >
              <NavigateNextIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
            </IconButton>
          </>
        )}
      </Box>

      {/* Pagination Dots */}
      {total > 1 && (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ justifyContent: 'center', alignItems: 'center', pt: 1.5 }}
        >
          {images.map((_, idx) => (
            <Box
              key={idx}
              component="button"
              type="button"
              aria-label={`Ir para imagem ${idx + 1}`}
              aria-current={idx === activeIndex ? 'true' : undefined}
              onClick={() => setActiveIndex(idx)}
              sx={{
                minWidth: 24,
                minHeight: 24,
                p: '8px 4px',
                border: 'none',
                bgcolor: 'transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                '&:focus-visible': {
                  outline: '2px solid #0D2B5C',
                  outlineOffset: 2,
                },
              }}
            >
              <Box
                sx={{
                  width: idx === activeIndex ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: idx === activeIndex ? 'mission.main' : 'divider',
                  transition: 'all 0.3s ease',
                }}
              />
            </Box>
          ))}
        </Stack>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxIndex !== null && lightboxIndex >= 0}
        close={() => setLightboxIndex(null)}
        index={lightboxIndex !== null ? lightboxIndex : 0}
        slides={images.map((src) => ({ src, alt: title }))}
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
          buttonPrev: total <= 1 ? () => null : undefined,
          buttonNext: total <= 1 ? () => null : undefined,
        }}
      />
    </Box>
  );
}
