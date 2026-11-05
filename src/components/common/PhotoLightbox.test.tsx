import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PhotoLightbox from './PhotoLightbox';

const viewer = () => document.querySelector('.yarl__container');

describe('PhotoLightbox', () => {
  it('stays closed without an index', () => {
    render(
      <PhotoLightbox slides={[{ src: '/a.png', alt: 'Foto A' }]} index={null} onClose={vi.fn()} />
    );

    expect(viewer()).not.toBeInTheDocument();
  });

  it('shows one photo without arrows or counter, with pt-BR controls', () => {
    render(
      <PhotoLightbox slides={[{ src: '/a.png', alt: 'Foto A' }]} index={0} onClose={vi.fn()} />
    );

    expect(viewer()).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Foto A' })).toHaveAttribute('src', '/a.png');
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aumentar zoom' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Próxima foto' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Foto anterior' })).not.toBeInTheDocument();
    expect(document.querySelector('.yarl__counter')).toBeNull();
  });

  it('browses several photos with a counter', () => {
    render(
      <PhotoLightbox
        slides={[
          { src: '/a.png', alt: 'Foto A' },
          { src: '/b.png', alt: 'Foto B' },
        ]}
        index={1}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Próxima foto' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Foto anterior' })).toBeInTheDocument();
    expect(document.querySelector('.yarl__counter')).toHaveTextContent('2 / 2');
  });

  it('closes from "Fechar"', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <PhotoLightbox slides={[{ src: '/a.png', alt: 'Foto A' }]} index={0} onClose={onClose} />
    );

    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <PhotoLightbox slides={[{ src: '/a.png', alt: 'Foto A' }]} index={0} onClose={onClose} />
    );

    await user.keyboard('{Escape}');
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});
