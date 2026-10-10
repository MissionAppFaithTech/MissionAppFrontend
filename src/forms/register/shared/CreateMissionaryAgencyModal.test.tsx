import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CreateMissionaryAgencyModal from './CreateMissionaryAgencyModal';

describe('CreateMissionaryAgencyModal', () => {
  it('validates required fields before saving', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();

    render(<CreateMissionaryAgencyModal open onClose={vi.fn()} onSave={handleSave} />);

    expect(screen.getByRole('heading', { name: /cadastrar agência missionária/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^salvar$/i }));

    expect(await screen.findByText(/informe o nome da agência/i)).toBeInTheDocument();
    expect(screen.getByText(/informe o país/i)).toBeInTheDocument();
    expect(screen.getByText(/informe o estado/i)).toBeInTheDocument();
    expect(screen.getByText(/informe a cidade/i)).toBeInTheDocument();
    expect(screen.getByText(/informe o telefone da agência/i)).toBeInTheDocument();
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('saves when required fields are valid', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();

    render(<CreateMissionaryAgencyModal open onClose={vi.fn()} onSave={handleSave} />);

    await user.type(screen.getByRole('textbox', { name: /^nome/i }), 'Nova Agência');
    await user.type(screen.getByRole('textbox', { name: /^país/i }), 'Brasil');
    await user.type(screen.getByRole('textbox', { name: /^estado/i }), 'SP');
    await user.type(screen.getByRole('textbox', { name: /^cidade/i }), 'Campinas');
    await user.type(screen.getByRole('textbox', { name: /^telefone$/i }), '11987654321');
    await user.click(screen.getByRole('button', { name: /^salvar$/i }));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Nova Agência',
        country: 'Brasil',
        state: 'SP',
        city: 'Campinas',
      })
    );
  });

  it('calls onClose from cancel without saving', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(<CreateMissionaryAgencyModal open onClose={handleClose} onSave={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
