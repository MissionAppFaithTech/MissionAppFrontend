import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ImageDropzone from '@/components/common/ImageDropzone';

const png = () => new File(['x'], 'capa.png', { type: 'image/png' });

describe('ImageDropzone', () => {
  it('shows the empty box as a clickable area with the call to action', () => {
    render(
      <ImageDropzone
        inputLabel="Upload de foto"
        onSelect={vi.fn()}
        emptyTitle="Clique para escolher"
        helperText="JPG, PNG ou WebP"
      />
    );

    expect(screen.getByText('Clique para escolher')).toBeInTheDocument();
    expect(screen.getByText(/arraste e solte/i)).toBeInTheDocument();
    const input = screen.getByLabelText('Upload de foto');
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAccessibleDescription('JPG, PNG ou WebP');
    // The whole box is the label of the input: clicking it opens the picker.
    expect(screen.getByText('Clique para escolher').closest('label')).toHaveAttribute(
      'for',
      input.id
    );
  });

  it('hands the chosen file to the host', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<ImageDropzone inputLabel="Upload de foto" onSelect={onSelect} />);

    const file = png();
    await user.upload(screen.getByLabelText('Upload de foto'), file);

    expect(onSelect).toHaveBeenCalledWith(file);
  });

  it('accepts a dropped image', () => {
    const onSelect = vi.fn();
    render(<ImageDropzone inputLabel="Upload de foto" onSelect={onSelect} />);

    const file = png();
    fireEvent.drop(screen.getByText(/clique para escolher/i).closest('label')!, {
      dataTransfer: { files: [file] },
    });

    expect(onSelect).toHaveBeenCalledWith(file);
  });

  it('ignores drops while disabled', () => {
    const onSelect = vi.fn();
    render(<ImageDropzone inputLabel="Upload de foto" onSelect={onSelect} disabled />);

    fireEvent.drop(screen.getByText(/clique para escolher/i).closest('label')!, {
      dataTransfer: { files: [png()] },
    });

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Upload de foto')).toBeDisabled();
  });

  it('shows the preview with a visible change bar', () => {
    render(
      <ImageDropzone
        inputLabel="Upload de foto"
        onSelect={vi.fn()}
        previewUrl="blob:preview"
        previewAlt="Prévia da capa"
        changeLabel="Alterar foto de capa"
      />
    );

    expect(screen.getByAltText('Prévia da capa')).toBeInTheDocument();
    expect(screen.getByText('Alterar foto de capa')).toBeInTheDocument();
    expect(screen.queryByText(/arraste e solte/i)).not.toBeInTheDocument();
  });

  it('links the error to the input and announces it', () => {
    render(
      <ImageDropzone
        inputLabel="Upload de foto"
        onSelect={vi.fn()}
        error="Use uma imagem JPG, PNG ou WebP."
      />
    );

    const input = screen.getByLabelText('Upload de foto');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Use uma imagem JPG, PNG ou WebP.');
    expect(screen.getByRole('alert')).toHaveTextContent('Use uma imagem JPG, PNG ou WebP.');
  });

  it('replaces the call to action with a notice when given one', () => {
    render(
      <ImageDropzone
        inputLabel="Upload de foto"
        onSelect={vi.fn()}
        emptyNotice="A capa atual ainda está sendo processada."
      />
    );

    expect(screen.getByText('A capa atual ainda está sendo processada.')).toBeInTheDocument();
    expect(screen.queryByText(/arraste e solte/i)).not.toBeInTheDocument();
  });
});
