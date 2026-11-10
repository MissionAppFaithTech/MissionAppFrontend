import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ProfilePictureDialog from './ProfilePictureDialog';
import type { PictureDialogView } from '@/hooks/useProfilePictureChange';
import { ApiError } from '@/lib/api/client';
import { PictureFileError, pictureErrorScreen } from '@/services/profilePicture.service';

const png = () => new File(['photo'], 'outra.png', { type: 'image/png' });

function setup(dialog: PictureDialogView, hadPicture = false) {
  const handlers = { onConfirm: vi.fn(), onRetry: vi.fn(), onSelect: vi.fn(), onClose: vi.fn() };
  const view = (next: PictureDialogView) => (
    <ProfilePictureDialog
      dialog={next}
      previewUrl="blob:preview"
      hadPicture={hadPicture}
      {...handlers}
    />
  );
  const utils = render(view(dialog));
  return { ...handlers, show: (next: PictureDialogView) => utils.rerender(view(next)) };
}

const errorView = (error: unknown): PictureDialogView => ({
  view: 'error',
  screen: pictureErrorScreen(error),
});

describe('ProfilePictureDialog', () => {
  it('renders nothing while closed', () => {
    setup({ view: 'closed' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('asks to confirm the photo with a round preview, focused on the main action', async () => {
    const user = userEvent.setup();
    const { onConfirm, onClose } = setup({ view: 'confirm' });

    const dialog = screen.getByRole('dialog', { name: 'Usar esta foto?' });
    expect(dialog).toHaveAccessibleDescription('É assim que sua foto vai aparecer no seu perfil.');
    expect(screen.getByRole('img', { name: 'Prévia da nova foto de perfil' })).toHaveAttribute(
      'src',
      'blob:preview'
    );
    expect(dialog).not.toHaveAttribute('aria-busy');
    expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();

    const confirm = screen.getByRole('button', { name: 'Usar esta foto' });
    expect(confirm).toHaveFocus();
    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('lets another photo be chosen from the confirmation', async () => {
    const user = userEvent.setup();
    const { onSelect } = setup({ view: 'confirm' });

    const input = screen.getByText('Escolher outra').querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
    await user.upload(input as HTMLInputElement, png());

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('closes the confirmation with Escape', async () => {
    const user = userEvent.setup();
    const { onClose } = setup({ view: 'confirm' });

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('locks the dialog and announces each step while the photo is sent', () => {
    const { show, onClose } = setup({ view: 'sending', stage: 'preparing', slow: false });

    const dialog = screen.getByRole('dialog', { name: 'Enviando sua foto' });
    expect(dialog).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Preparando sua foto...');
    expect(dialog).toHaveAccessibleDescription('Preparando sua foto...');
    // No way out: no buttons, Escape and the backdrop do nothing.
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    fireEvent.click(document.querySelector('.MuiBackdrop-root') as Element);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();

    show({ view: 'sending', stage: 'uploading', slow: false });
    expect(screen.getByRole('status')).toHaveTextContent('Enviando sua foto...');
    expect(screen.queryByText(/demorando/)).not.toBeInTheDocument();

    show({ view: 'sending', stage: 'finishing', slow: true });
    expect(screen.getByRole('status')).toHaveTextContent('Quase pronto...');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Está demorando um pouco mais que o normal. Não feche esta tela.'
    );
  });

  it('shows a connection error with "Tentar novamente" focused and no other photo offer', async () => {
    const user = userEvent.setup();
    const { onRetry, onClose } = setup(errorView(new ApiError('rede', 0)), true);

    const dialog = screen.getByRole('dialog', { name: 'Sem conexão com a internet' });
    expect(dialog).not.toHaveAttribute('aria-busy');
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Verifique seu Wi‑Fi ou seus dados móveis e tente de novo.');
    expect(alert).toHaveTextContent('Sua foto atual não foi alterada.');
    expect(screen.queryByText('Escolher outra foto')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    const retry = screen.getByRole('button', { name: 'Tentar novamente' });
    expect(retry).toHaveFocus();
    await user.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);

    const close = screen.getAllByRole('button', { name: 'Fechar' });
    expect(close).toHaveLength(2);
    await user.click(close[1]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('offers both trying again and another photo when the send failed', () => {
    setup(errorView(new ApiError('fora do ar', 502)));

    expect(screen.getByRole('dialog', { name: 'Não foi possível enviar a foto' })).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Você continua sem foto de perfil.');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveFocus();
    expect(screen.getByText('Escolher outra foto')).toBeInTheDocument();
  });

  it('makes "Escolher outra foto" the main action when the file cannot be used', async () => {
    const user = userEvent.setup();
    const { onSelect } = setup(errorView(new PictureFileError('unreadable')));

    expect(screen.getByRole('dialog', { name: 'Não conseguimos abrir esta imagem' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
    const pick = screen.getByText('Escolher outra foto');
    expect(pick).toHaveFocus();

    await user.upload(pick.querySelector('input[type="file"]') as HTMLInputElement, png());
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('keeps the last screen while it closes', () => {
    const { show } = setup(errorView(new ApiError('calma', 429)));

    show({ view: 'closed' });

    // Still fading out: the title does not flash back to the confirmation.
    expect(screen.queryByText('Usar esta foto?')).not.toBeInTheDocument();
  });
});
