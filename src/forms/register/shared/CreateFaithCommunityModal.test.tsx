import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import CreateFaithCommunityModal from './CreateFaithCommunityModal';

describe('CreateFaithCommunityModal', () => {
  it('validates required church, location, pastor and contact fields', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();

    render(<CreateFaithCommunityModal open onClose={vi.fn()} onSave={handleSave} />);

    expect(
      screen.getByRole('heading', { name: /cadastrar comunidade de fé/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/igreja batista do centro/i)).toBeVisible();
    expect(screen.getByPlaceholderText('00000-000')).toBeVisible();
    expect(screen.getByPlaceholderText(/rua das palmeiras/i)).toBeVisible();
    expect(screen.getByPlaceholderText(/pr\. ana souza/i)).toBeVisible();
    expect(
      (screen.getByLabelText(/telefone da igreja/i) as HTMLInputElement).labels?.[0]
    ).toHaveTextContent('*');
    expect(
      (screen.getByLabelText(/telefone do pastor/i) as HTMLInputElement).labels?.[0]
    ).toHaveTextContent('*');
    await user.click(screen.getByRole('button', { name: /^salvar$/i }));

    expect(await screen.findByText(/informe o nome da igreja/i)).toBeInTheDocument();
    expect(screen.getByText(/informe o país/i)).toBeInTheDocument();
    expect(screen.getByText(/informe o estado/i)).toBeInTheDocument();
    expect(screen.getByText(/informe a cidade/i)).toBeInTheDocument();
    expect(screen.getByText(/informe o nome do pastor/i)).toBeInTheDocument();
    expect(screen.getByText(/informe o telefone da igreja/i)).toBeInTheDocument();
    expect(screen.getByText(/informe o telefone do pastor/i)).toBeInTheDocument();
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('saves when required fields are valid', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();

    render(<CreateFaithCommunityModal open onClose={vi.fn()} onSave={handleSave} />);

    await user.type(screen.getByRole('textbox', { name: /^nome(\s*\*)?$/i }), 'Igreja Nova');
    await user.type(screen.getByRole('textbox', { name: /^país/i }), 'Brasil');
    await user.type(screen.getByRole('textbox', { name: /^estado/i }), 'RJ');
    await user.type(screen.getByRole('textbox', { name: /^cidade/i }), 'Niterói');
    await user.type(screen.getByRole('textbox', { name: /nome do pastor/i }), 'Pr. Ana');
    await user.type(screen.getByRole('textbox', { name: /telefone da igreja/i }), '2134567890');
    await user.type(screen.getByRole('textbox', { name: /telefone do pastor/i }), '21987654321');
    await user.click(screen.getByRole('button', { name: /^salvar$/i }));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Igreja Nova',
        country: 'Brasil',
        pastorName: 'Pr. Ana',
      })
    );
  });

  it('saving never submits the step form around it', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();
    const stepSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());

    // NOTE: the modal lives inside the sign-up step's <form> (React tree), as in MissionariesStep2
    render(
      <form onSubmit={stepSubmit}>
        <CreateFaithCommunityModal open onClose={vi.fn()} onSave={handleSave} />
      </form>
    );
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /^salvar$/i }));

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(stepSubmit).not.toHaveBeenCalled();
  });

  async function fillValid(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByRole('textbox', { name: /^nome(\s*\*)?$/i }), 'Igreja Nova');
    await user.type(screen.getByRole('textbox', { name: /^país/i }), 'Brasil');
    await user.type(screen.getByRole('textbox', { name: /^estado/i }), 'RJ');
    await user.type(screen.getByRole('textbox', { name: /^cidade/i }), 'Niterói');
    await user.type(screen.getByRole('textbox', { name: /nome do pastor/i }), 'Pr. Ana');
    await user.type(screen.getByRole('textbox', { name: /telefone da igreja/i }), '2134567890');
    await user.type(screen.getByRole('textbox', { name: /telefone do pastor/i }), '21987654321');
  }

  it('puts the API field errors on the fields (the church phone too) and stays open', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleSave = vi.fn().mockRejectedValue(
      new ApiError('Revise os campos destacados e tente novamente.', 422, {
        name: 'Já existe uma comunidade com este nome nesta cidade.',
        phoneNumber: 'Telefone inválido.',
      })
    );

    render(<CreateFaithCommunityModal open onClose={handleClose} onSave={handleSave} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /^salvar$/i }));

    const name = screen.getByRole('textbox', { name: /^nome(\s*\*)?$/i });
    expect(
      await screen.findByText('Já existe uma comunidade com este nome nesta cidade.')
    ).toBeVisible();
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveFocus();
    expect(
      screen.getByRole('textbox', { name: /telefone da igreja/i })
    ).toHaveAccessibleDescription(/Telefone inválido\./);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('shows an error without a field in an alert inside the dialog', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn().mockRejectedValue(new ApiError('Sem conexão com o servidor.', 503));

    render(<CreateFaithCommunityModal open onClose={vi.fn()} onSave={handleSave} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /^salvar$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Sem conexão com o servidor.');
  });
});
