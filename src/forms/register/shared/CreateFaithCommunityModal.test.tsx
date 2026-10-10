import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CreateFaithCommunityModal from './CreateFaithCommunityModal';

describe('CreateFaithCommunityModal', () => {
  it('validates required church, location, pastor and contact fields', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();

    render(<CreateFaithCommunityModal open onClose={vi.fn()} onSave={handleSave} />);

    expect(screen.getByRole('heading', { name: /cadastrar igreja/i })).toBeInTheDocument();
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
});
