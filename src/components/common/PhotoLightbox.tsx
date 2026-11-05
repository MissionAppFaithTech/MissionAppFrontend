'use client';

import Lightbox from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';

export type PhotoLightboxSlide = { src: string; alt: string };

/** pt-BR names for the viewer's controls and regions (screen readers). */
const LABELS = {
  Lightbox: 'Visualizador de fotos',
  Carousel: 'Fotos',
  Slide: 'Foto',
  'Photo gallery': 'Galeria de fotos',
  '{index} of {total}': '{index} de {total}',
  Close: 'Fechar',
  Previous: 'Foto anterior',
  Next: 'Próxima foto',
  'Zoom in': 'Aumentar zoom',
  'Zoom out': 'Diminuir zoom',
};

type PhotoLightboxProps = {
  slides: PhotoLightboxSlide[];
  /** Slide shown when open; `null` keeps the viewer closed. */
  index: number | null;
  onClose: () => void;
};

/**
 * Full-screen photo viewer shared by the app (project and campaign galleries,
 * profile photo): zoom by pinch, wheel or double tap, Escape or a tap on the
 * backdrop closes it. A single photo hides the arrows and the counter.
 */
export default function PhotoLightbox({ slides, index, onClose }: PhotoLightboxProps) {
  const single = slides.length <= 1;

  return (
    <Lightbox
      open={index !== null && index >= 0}
      close={onClose}
      index={index ?? 0}
      slides={slides}
      plugins={single ? [Zoom] : [Zoom, Counter]}
      animation={{ fade: 250, swipe: 250 }}
      carousel={{ finite: single, padding: '24px', spacing: '24px' }}
      controller={{ closeOnBackdropClick: true }}
      labels={LABELS}
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
        buttonPrev: single ? () => null : undefined,
        buttonNext: single ? () => null : undefined,
      }}
    />
  );
}
