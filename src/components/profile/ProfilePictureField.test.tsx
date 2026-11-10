import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfilePictureField from './ProfilePictureField';
import { SLOW_SEND_AFTER_MS, useProfilePictureChange } from '@/hooks/useProfilePictureChange';
import { ApiError } from '@/lib/api/client';
import {
  changeProfilePicture,
  PICTURE_PROCESSING_FAILED_CODE,
  removeProfilePicture,
} from '@/services/profilePicture.service';
import { useFeedbackStore } from '@/stores/feedbackStore';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh, prefetch: vi.fn() }),
}));

vi.mock('@/services/profilePicture.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/profilePicture.service')>()),
  changeProfilePicture: vi.fn(),
  removeProfilePicture: vi.fn(),
}));

const sendPhoto = vi.mocked(changeProfilePicture);
const removePhoto = vi.mocked(removeProfilePicture);

const OLD_URL = 'https://cdn.test/old.webp';
const NEW_URL = 'https://cdn.test/new.webp';
const png = (name = 'foto.png') => new File(['photo'], name, { type: 'image/png' });

/** The edit forms own the hook; the field only renders it. */
function Harness({
  currentUrl,
  disabled,
  accountId = 'user-a',
}: {
  currentUrl?: string;
  disabled?: boolean;
  accountId?: string;
}) {
  const picture = useProfilePictureChange(currentUrl, accountId);
  return <ProfilePictureField picture={picture} displayName="Ana" disabled={disabled} />;
}

const photo = () => screen.queryByRole('img', { name: 'Foto de perfil de Ana' });
const toast = () => useFeedbackStore.getState().current;
const picker = (name: RegExp = /adicionar foto de perfil/i) => screen.getByLabelText(name);
const closed = () => waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

/** A send the test finishes by hand. */
function pendingSend() {
  let resolve!: (value: { url: string | null }) => void;
  let reject!: (error: unknown) => void;
  sendPhoto.mockImplementationOnce(
    () =>
      new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      })
  );
  return { resolve: (url: string | null) => resolve({ url }), reject: (e: unknown) => reject(e) };
}

describe('ProfilePictureField (saved right away)', () => {
  let urls = 0;
  let revoke: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    urls = 0;
    refresh.mockClear();
    sendPhoto.mockReset();
    removePhoto.mockReset();
    sendPhoto.mockResolvedValue({ url: NEW_URL });
    removePhoto.mockResolvedValue(undefined);
    useFeedbackStore.setState({ current: null });
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:preview-${++urls}`);
    revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  it('offers an accessible picker limited to JPG, PNG and WebP and says when it saves', () => {
    render(<Harness />);

    const input = picker().querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
    const hint = screen.getByText(
      'Use uma foto em JPG, PNG ou WebP. A foto é salva assim que você confirma.'
    );
    expect(picker()).toHaveAttribute('aria-describedby', hint.id);
    expect(screen.queryByRole('button', { name: /remover foto/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('offers a large "Adicionar foto" button without a photo and "Editar foto" above "Remover foto" with one', () => {
    const { rerender } = render(<Harness />);

    expect(picker()).toHaveTextContent('Adicionar foto');
    expect(screen.queryByRole('button', { name: 'Remover foto' })).not.toBeInTheDocument();

    rerender(<Harness currentUrl={OLD_URL} />);
    const edit = picker(/editar foto de perfil/i);
    expect(edit).toHaveTextContent('Editar foto');
    const remove = screen.getByRole('button', { name: 'Remover foto' });
    // "Editar foto" comes right before "Remover foto".
    expect(edit.compareDocumentPosition(remove) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(edit.parentElement).toBe(remove.parentElement);
  });

  it('asks before using a chosen photo and sends nothing until confirmed', async () => {
    const user = userEvent.setup();
    render(<Harness currentUrl={OLD_URL} />);

    await user.upload(picker(/editar foto de perfil/i), png());

    const dialog = screen.getByRole('dialog', { name: 'Usar esta foto?' });
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', 'blob:preview-1');
    expect(sendPhoto).not.toHaveBeenCalled();
    // The saved photo stays until the new one is confirmed and sent.
    expect(document.querySelector(`img[src="${OLD_URL}"]`)).not.toBeNull();
  });

  it('leaves everything as it was when the confirmation is closed', async () => {
    const user = userEvent.setup();
    render(<Harness currentUrl={OLD_URL} />);

    await user.upload(picker(/editar foto de perfil/i), png());
    await user.click(screen.getByRole('button', { name: 'Fechar' }));

    await closed();
    expect(sendPhoto).not.toHaveBeenCalled();
    expect(photo()).toHaveAttribute('src', OLD_URL);
    expect(toast()).toBeNull();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('sends the confirmed photo while the dialog waits, then shows it with a green toast', async () => {
    const user = userEvent.setup();
    const sending = pendingSend();
    render(<Harness />);

    const file = png();
    await user.upload(picker(), file);
    await user.click(screen.getByRole('button', { name: 'Usar esta foto' }));

    expect(screen.getByRole('dialog', { name: 'Enviando sua foto' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Preparando sua foto...');
    expect(sendPhoto).toHaveBeenCalledWith(
      expect.objectContaining({ file, progress: {}, onStage: expect.any(Function) })
    );
    // The field is locked meanwhile.
    expect(picker().querySelector('input')).toBeDisabled();

    const { onStage } = sendPhoto.mock.calls[0][0];
    act(() => onStage?.('uploading'));
    expect(screen.getByRole('status')).toHaveTextContent('Enviando sua foto...');

    await act(async () => sending.resolve(NEW_URL));

    await closed();
    expect(photo()).toHaveAttribute('src', NEW_URL);
    expect(toast()).toMatchObject({
      message: 'Foto de perfil adicionada com sucesso.',
      severity: 'success',
    });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(picker(/editar foto de perfil/i).querySelector('input')).not.toBeDisabled();
  });

  it('says the photo was updated when there was one before', async () => {
    const user = userEvent.setup();
    render(<Harness currentUrl={OLD_URL} />);

    await user.upload(picker(/editar foto de perfil/i), png());
    await user.click(screen.getByRole('button', { name: 'Usar esta foto' }));

    await waitFor(() =>
      expect(toast()).toMatchObject({
        message: 'Foto de perfil atualizada com sucesso.',
        severity: 'success',
      })
    );
    await closed();
    expect(photo()).toHaveAttribute('src', NEW_URL);
  });

  it('keeps the local preview with a blue toast while the backend still processes the photo', async () => {
    const user = userEvent.setup();
    sendPhoto.mockResolvedValue({ url: null });
    const { rerender } = render(<Harness currentUrl={OLD_URL} />);

    await user.upload(picker(/editar foto de perfil/i), png());
    await user.click(screen.getByRole('button', { name: 'Usar esta foto' }));

    await waitFor(() =>
      expect(toast()).toMatchObject({
        message: 'Foto enviada. Ela aparece em instantes.',
        severity: 'info',
      })
    );
    await closed();
    expect(photo()).toHaveAttribute('src', 'blob:preview-1');
    expect(revoke).not.toHaveBeenCalled();

    // The refreshed account has no URL yet: the preview stays.
    rerender(<Harness />);
    expect(photo()).toHaveAttribute('src', 'blob:preview-1');

    // Once the server has it, the server photo wins.
    rerender(<Harness currentUrl={NEW_URL} />);
    expect(photo()).toHaveAttribute('src', NEW_URL);
  });

  it('follows the server photo again after the refresh', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Harness currentUrl={OLD_URL} />);

    await user.upload(picker(/editar foto de perfil/i), png());
    await user.click(screen.getByRole('button', { name: 'Usar esta foto' }));
    await closed();

    rerender(<Harness currentUrl="https://cdn.test/served.webp" />);
    expect(photo()).toHaveAttribute('src', 'https://cdn.test/served.webp');
  });

  it('never shows another account the photo this one sent or was choosing', async () => {
    const user = userEvent.setup();
    sendPhoto.mockResolvedValue({ url: null });
    const { rerender } = render(<Harness />);

    await user.upload(picker(), png());
    await user.click(screen.getByRole('button', { name: 'Usar esta foto' }));
    await closed();
    expect(photo()).toHaveAttribute('src', 'blob:preview-1');
    await user.upload(picker(/editar foto de perfil/i), png('outra.png'));
    expect(screen.getByRole('dialog', { name: 'Usar esta foto?' })).toBeInTheDocument();

    rerender(<Harness accountId="user-b" />);

    await closed();
    expect(photo()).not.toBeInTheDocument();
    expect(picker()).toHaveTextContent('Adicionar foto');

    rerender(<Harness accountId="user-b" currentUrl={OLD_URL} />);
    expect(photo()).toHaveAttribute('src', OLD_URL);
  });

  it('tells a slow send is still running', async () => {
    vi.useFakeTimers();
    try {
      pendingSend();
      render(<Harness />);

      fireEvent.change(picker().querySelector('input') as HTMLInputElement, {
        target: { files: [png()] },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Usar esta foto' }));

      await act(() => vi.advanceTimersByTimeAsync(SLOW_SEND_AFTER_MS - 1));
      expect(screen.queryByText(/demorando/)).not.toBeInTheDocument();

      await act(() => vi.advanceTimersByTimeAsync(1));
      expect(screen.getByRole('status')).toHaveTextContent(
        'Está demorando um pouco mais que o normal. Não feche esta tela.'
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('asks before the tab is closed only while a send is running', async () => {
    const user = userEvent.setup();
    const sending = pendingSend();
    render(<Harness />);
    const leave = () => {
      const event = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    };

    await user.upload(picker(), png());
    expect(leave()).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Usar esta foto' }));
    expect(leave()).toBe(true);

    await act(async () => sending.resolve(NEW_URL));
    expect(leave()).toBe(false);
  });

  it('shows what went wrong, keeps the photo and resumes the same send on "Tentar novamente"', async () => {
    const user = userEvent.setup();
    sendPhoto.mockRejectedValueOnce(new ApiError('rede', 0));
    render(<Harness currentUrl={OLD_URL} />);

    const file = png();
    await user.upload(picker(/editar foto de perfil/i), file);
    await user.click(screen.getByRole('button', { name: 'Usar esta foto' }));

    expect(
      await screen.findByRole('dialog', { name: 'Sem conexão com a internet' })
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Sua foto atual não foi alterada.');
    expect(document.querySelector(`img[src="${OLD_URL}"]`)).not.toBeNull();
    expect(toast()).toBeNull();
    expect(refresh).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    await closed();
    expect(sendPhoto).toHaveBeenCalledTimes(2);
    expect(sendPhoto.mock.calls[1][0].file).toBe(file);
    // Same progress object: the service resumes instead of starting over.
    expect(sendPhoto.mock.calls[1][0].progress).toBe(sendPhoto.mock.calls[0][0].progress);
    expect(photo()).toHaveAttribute('src', NEW_URL);
  });

  it('asks for another photo when the backend could not process it, starting a new send', async () => {
    const user = userEvent.setup();
    sendPhoto.mockRejectedValueOnce(
      new ApiError('falhou', 422, {}, PICTURE_PROCESSING_FAILED_CODE)
    );
    render(<Harness />);

    await user.upload(picker(), png());
    await user.click(screen.getByRole('button', { name: 'Usar esta foto' }));

    expect(
      await screen.findByRole('dialog', { name: 'Não conseguimos usar esta imagem' })
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Você continua sem foto de perfil.');
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();

    const other = png('outra.png');
    await user.upload(
      screen.getByText('Escolher outra foto').querySelector('input') as HTMLInputElement,
      other
    );

    const dialog = screen.getByRole('dialog', { name: 'Usar esta foto?' });
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', 'blob:preview-2');
    // The first preview is freed once replaced.
    expect(revoke).toHaveBeenCalledWith('blob:preview-1');

    await user.click(screen.getByRole('button', { name: 'Usar esta foto' }));
    await closed();
    expect(sendPhoto.mock.calls[1][0].file).toBe(other);
    expect(sendPhoto.mock.calls[1][0].progress).not.toBe(sendPhoto.mock.calls[0][0].progress);
  });

  it('refuses another file type on an error screen, without a preview', async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<Harness currentUrl={OLD_URL} />);

    await user.upload(
      picker(/editar foto de perfil/i),
      new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' })
    );

    expect(
      screen.getByRole('dialog', { name: 'Não dá para usar este arquivo' })
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Escolha uma foto em JPG, PNG ou WebP.');
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(sendPhoto).not.toHaveBeenCalled();

    await user.click(screen.getAllByRole('button', { name: 'Fechar' })[1]);
    await closed();
    expect(photo()).toHaveAttribute('src', OLD_URL);
  });

  it('just closes when the session ended during the send', async () => {
    const user = userEvent.setup();
    sendPhoto.mockRejectedValueOnce(new ApiError('Sessão expirada', 401));
    render(<Harness currentUrl={OLD_URL} />);

    await user.upload(picker(/editar foto de perfil/i), png());
    await user.click(screen.getByRole('button', { name: 'Usar esta foto' }));

    await closed();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(photo()).toHaveAttribute('src', OLD_URL);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('ignores a picker closed without a file and lets the same file be picked again', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = picker().querySelector('input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [] } });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.upload(input, png());
    expect(input.value).toBe('');
  });

  it('frees the preview when the form goes away', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Harness />);

    await user.upload(picker(), png());
    expect(revoke).not.toHaveBeenCalled();

    unmount();
    expect(revoke).toHaveBeenCalledWith('blob:preview-1');
  });

  it('asks before removing the photo and keeps it on "Manter foto"', async () => {
    const user = userEvent.setup();
    render(<Harness currentUrl={OLD_URL} />);

    await user.click(screen.getByRole('button', { name: 'Remover foto' }));

    const dialog = screen.getByRole('dialog', { name: 'Remover sua foto de perfil?' });
    expect(dialog).toHaveAccessibleDescription(
      'Seu perfil vai ficar sem foto até você adicionar outra.'
    );
    const keep = within(dialog).getByRole('button', { name: 'Manter foto' });
    expect(keep).toHaveFocus();
    await user.click(keep);

    await closed();
    expect(removePhoto).not.toHaveBeenCalled();
    expect(photo()).toHaveAttribute('src', OLD_URL);
  });

  it('removes the photo right away once confirmed, with a green toast', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Harness currentUrl={OLD_URL} />);

    await user.click(screen.getByRole('button', { name: 'Remover foto' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Remover foto' })
    );

    await closed();
    expect(removePhoto).toHaveBeenCalledTimes(1);
    expect(photo()).not.toBeInTheDocument();
    expect(picker()).toHaveTextContent('Adicionar foto');
    expect(toast()).toMatchObject({
      message: 'Foto de perfil removida com sucesso.',
      severity: 'success',
    });
    expect(refresh).toHaveBeenCalledTimes(1);

    // The refreshed account has no photo either.
    rerender(<Harness />);
    expect(photo()).not.toBeInTheDocument();
  });

  it('says the removal failed, keeps the photo and tries again on request', async () => {
    const user = userEvent.setup();
    removePhoto.mockRejectedValueOnce(new ApiError('fora do ar', 502));
    render(<Harness currentUrl={OLD_URL} />);

    await user.click(screen.getByRole('button', { name: 'Remover foto' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Remover foto' })
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível remover a foto. Tente novamente. Sua foto atual não foi alterada.'
    );
    expect(document.querySelector(`img[src="${OLD_URL}"]`)).not.toBeNull();
    expect(toast()).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    await closed();
    expect(removePhoto).toHaveBeenCalledTimes(2);
    expect(photo()).not.toBeInTheDocument();
  });

  it('closes the removal when the session ended', async () => {
    const user = userEvent.setup();
    removePhoto.mockRejectedValueOnce(new ApiError('Sessão expirada', 401));
    render(<Harness currentUrl={OLD_URL} />);

    await user.click(screen.getByRole('button', { name: 'Remover foto' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Remover foto' })
    );

    await closed();
    expect(photo()).toHaveAttribute('src', OLD_URL);
  });

  it('disables the controls while the form is saved', () => {
    render(<Harness currentUrl={OLD_URL} disabled />);

    expect(picker(/editar foto de perfil/i).querySelector('input')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remover foto' })).toBeDisabled();
  });

  it('enlarges the photo from the avatar', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Harness />);
    expect(
      screen.queryByRole('button', { name: /ampliar foto de perfil/i })
    ).not.toBeInTheDocument();

    rerender(<Harness currentUrl={OLD_URL} />);
    await user.click(screen.getByRole('button', { name: 'Ampliar foto de perfil de Ana' }));

    expect(document.querySelector(`.yarl__container img[src="${OLD_URL}"]`)).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(document.querySelector('.yarl__container')).toBeNull());
  });
});
