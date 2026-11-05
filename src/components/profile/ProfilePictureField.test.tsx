import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfilePictureField from './ProfilePictureField';
import { useProfilePictureDraft } from '@/hooks/useProfilePictureDraft';

const png = (name = 'foto.png') => new File(['photo'], name, { type: 'image/png' });

/** The edit forms own the draft; this harness exposes what they would send on "Salvar". */
function Harness({ currentUrl, processing }: { currentUrl?: string; processing?: boolean }) {
  const picture = useProfilePictureDraft(currentUrl);
  return (
    <>
      <ProfilePictureField picture={picture} displayName="Ana" processing={processing} />
      <span data-testid="change">{JSON.stringify(picture.change?.kind ?? 'none')}</span>
      <button type="button" onClick={picture.reset}>
        Cancelar
      </button>
    </>
  );
}

const change = () => JSON.parse(screen.getByTestId('change').textContent ?? '""');
const photo = () => screen.queryByRole('img', { name: 'Foto de perfil de Ana' });

describe('ProfilePictureField (staged until "Salvar")', () => {
  let urls = 0;
  beforeEach(() => {
    urls = 0;
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:preview-${++urls}`);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  it('offers an accessible picker limited to JPG, PNG and WebP and says when it saves', () => {
    render(<Harness />);

    const picker = screen.getByLabelText(/adicionar foto de perfil/i);
    expect(picker.querySelector('input[type="file"]')).toHaveAttribute(
      'accept',
      'image/jpeg,image/png,image/webp'
    );
    expect(
      screen.getByText('JPG, PNG ou WebP de até 5 MB. A foto é salva quando você clica em Salvar.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remover foto/i })).not.toBeInTheDocument();
  });

  it('only previews a chosen photo and stages it for "Salvar"', async () => {
    const user = userEvent.setup();
    render(<Harness currentUrl="https://cdn.test/old.webp" />);

    await user.upload(screen.getByLabelText(/editar foto de perfil/i), png());

    expect(photo()).toHaveAttribute('src', 'blob:preview-1');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Nova foto selecionada. Ela será salva quando você clicar em Salvar.'
    );
    expect(change()).toBe('replace');
  });

  it('stages the removal of the saved photo', async () => {
    const user = userEvent.setup();
    render(<Harness currentUrl="https://cdn.test/old.webp" />);

    await user.click(screen.getByRole('button', { name: /remover foto/i }));

    expect(photo()).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'A foto será removida quando você clicar em Salvar.'
    );
    expect(change()).toBe('remove');
    expect(screen.getByLabelText(/adicionar foto de perfil/i)).toBeInTheDocument();
  });

  it('removing a staged photo without a saved one leaves nothing to save', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.upload(screen.getByLabelText(/adicionar foto de perfil/i), png());
    await user.click(screen.getByRole('button', { name: /remover foto/i }));

    expect(photo()).not.toBeInTheDocument();
    expect(change()).toBe('none');
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('goes back to the saved photo when the form cancels', async () => {
    const user = userEvent.setup();
    render(<Harness currentUrl="https://cdn.test/old.webp" />);

    await user.upload(screen.getByLabelText(/editar foto de perfil/i), png());
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(photo()).toHaveAttribute('src', 'https://cdn.test/old.webp');
    expect(change()).toBe('none');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-1');
  });

  it('frees the previous preview when another photo is chosen', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.upload(screen.getByLabelText(/adicionar foto de perfil/i), png('a.png'));
    await user.upload(screen.getByLabelText(/editar foto de perfil/i), png('b.png'));

    expect(photo()).toHaveAttribute('src', 'blob:preview-2');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-1');
  });

  it('refuses another file type in an alert, keeping the current photo', async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<Harness currentUrl="https://cdn.test/old.webp" />);

    await user.upload(
      screen.getByLabelText(/editar foto de perfil/i),
      new File(['x'], 'foto.bmp', { type: 'image/bmp' })
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/jpg, png ou webp/i);
    expect(photo()).toHaveAttribute('src', 'https://cdn.test/old.webp');
    expect(change()).toBe('none');

    await user.upload(screen.getByLabelText(/editar foto de perfil/i), png());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('announces the processing while the form saves the photo', () => {
    render(<Harness currentUrl="https://cdn.test/old.webp" processing />);

    expect(screen.getByRole('status')).toHaveTextContent('Processando a foto de perfil...');
  });

  it('disables the controls while the form is saved', () => {
    const picture = {
      draft: { kind: 'keep' as const },
      photoUrl: 'https://cdn.test/old.webp',
      error: null,
      dirty: false,
      change: undefined,
      select: vi.fn(),
      remove: vi.fn(),
      reset: vi.fn(),
    };
    render(<ProfilePictureField picture={picture} displayName="Ana" disabled />);

    expect(screen.getByLabelText(/editar foto de perfil/i).querySelector('input')).toBeDisabled();
    expect(screen.getByRole('button', { name: /remover foto/i })).toBeDisabled();
  });

  it('describes the picker with the hint and marks the avatar busy only while processing', () => {
    const { rerender } = render(<Harness />);

    expect(screen.getByLabelText(/adicionar foto de perfil/i)).toHaveAccessibleDescription(
      'JPG, PNG ou WebP de até 5 MB. A foto é salva quando você clica em Salvar.'
    );
    expect(document.querySelector('[aria-busy]')).toBeNull();

    rerender(<Harness processing />);
    expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it('ignores a picker closed without a file', () => {
    render(<Harness currentUrl="https://cdn.test/old.webp" />);
    const input = screen
      .getByLabelText(/editar foto de perfil/i)
      .querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [] } });

    expect(photo()).toHaveAttribute('src', 'https://cdn.test/old.webp');
    expect(change()).toBe('none');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clears a refused-file error on removal and on cancel', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const gif = new File(['x'], 'foto.gif', { type: 'image/gif' });
    render(<Harness currentUrl="https://cdn.test/old.webp" />);

    await user.upload(screen.getByLabelText(/editar foto de perfil/i), gif);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /remover foto/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await user.upload(screen.getByLabelText(/adicionar foto de perfil/i), gif);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('frees no preview when a staged removal is undone', async () => {
    const user = userEvent.setup();
    render(<Harness currentUrl="https://cdn.test/old.webp" />);

    await user.click(screen.getByRole('button', { name: /remover foto/i }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it('enlarges the saved photo from the avatar', async () => {
    const user = userEvent.setup();
    render(<Harness currentUrl="https://cdn.test/old.webp" />);

    await user.click(screen.getByRole('button', { name: 'Ampliar foto de perfil de Ana' }));

    expect(
      document.querySelector('.yarl__container img[src="https://cdn.test/old.webp"]')
    ).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(document.querySelector('.yarl__container')).toBeNull());
  });

  it('enlarges the staged photo before it is saved', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(
      screen.queryByRole('button', { name: /ampliar foto de perfil/i })
    ).not.toBeInTheDocument();

    await user.upload(screen.getByLabelText(/adicionar foto de perfil/i), png());
    await user.click(screen.getByRole('button', { name: 'Ampliar foto de perfil de Ana' }));

    expect(document.querySelector('.yarl__container img[src="blob:preview-1"]')).not.toBeNull();
  });

  it('offers a large "Adicionar foto" button without a photo and "Editar foto" above "Remover foto" with one', () => {
    const { rerender } = render(<Harness />);

    const add = screen.getByLabelText('Adicionar foto de perfil');
    expect(add).toHaveTextContent('Adicionar foto');
    expect(screen.queryByRole('button', { name: 'Remover foto' })).not.toBeInTheDocument();

    rerender(<Harness currentUrl="https://cdn.test/old.webp" />);
    const edit = screen.getByLabelText('Editar foto de perfil');
    expect(edit).toHaveTextContent('Editar foto');
    const remove = screen.getByRole('button', { name: 'Remover foto' });
    // "Editar foto" comes right before "Remover foto".
    expect(edit.compareDocumentPosition(remove) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(edit.parentElement).toBe(remove.parentElement);
  });
});
