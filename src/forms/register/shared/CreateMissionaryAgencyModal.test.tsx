import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { lookupCep } from '@/services/cep.service';
import CreateMissionaryAgencyModal from './CreateMissionaryAgencyModal';

vi.mock('@/services/cep.service', () => ({
  lookupCep: vi.fn(),
}));

describe('CreateMissionaryAgencyModal', () => {
  it('validates required fields before saving', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();

    render(<CreateMissionaryAgencyModal open onClose={vi.fn()} onSave={handleSave} />);

    expect(
      screen.getByRole('heading', { name: /cadastrar agência missionária/i })
    ).toBeInTheDocument();
    const nameField = screen.getByRole('textbox', { name: /^nome/i });
    expect(nameField).toBeVisible();
    expect(screen.getByText('Nome', { selector: 'label' })).toBeVisible();
    expect(screen.getAllByRole('textbox', { name: /cep ou código postal/i })).toHaveLength(1);
    expect(screen.getByPlaceholderText(/jovens com uma missão/i)).toBeVisible();
    expect(screen.getByPlaceholderText('00000-000')).toBeVisible();
    expect(screen.getByPlaceholderText(/av\. sete de setembro/i)).toBeVisible();
    expect(screen.getByPlaceholderText('Brasil')).toBeVisible();
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

  it('fills city, state and street after a CEP lookup', async () => {
    const user = userEvent.setup();
    vi.mocked(lookupCep).mockResolvedValue({
      zipCode: '01310-100',
      address1: 'Avenida Paulista',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
    });

    render(<CreateMissionaryAgencyModal open onClose={vi.fn()} onSave={vi.fn()} />);

    await user.type(screen.getByRole('textbox', { name: /cep ou código postal/i }), '01310100');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /^cidade/i })).toHaveValue('São Paulo');
    });
    expect(screen.getByRole('textbox', { name: /^estado/i })).toHaveValue('SP');
    expect(screen.getByRole('textbox', { name: /^endereço/i })).toHaveValue('Avenida Paulista');
    expect(screen.getByRole('textbox', { name: /^país/i })).toHaveValue('Brasil');
  });
});
