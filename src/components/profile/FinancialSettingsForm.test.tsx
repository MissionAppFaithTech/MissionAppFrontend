import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FinancialSettingsForm from './FinancialSettingsForm';
import type { FinancialConfigData } from '@/types/profile';

const mockFinancialData: FinancialConfigData = {
  supporterMessage: 'Obrigado por apoiar nosso ministério na África!',
  pix: {
    enabled: true,
    key: 'missionario@email.com',
    keyType: 'email',
    qrCodeUrl: '/images/test-qr.png',
  },
  bankTransfer: {
    enabled: true,
    bankName: 'Banco do Brasil',
    bankNumber: '001',
    agency: '1234-5',
    account: '98765-4',
    accountType: 'corrente',
    holderName: 'Samuel Mendonça',
    holderDocument: '123.456.789-00',
  },
};

describe('FinancialSettingsForm Component', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL for file uploads
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  });

  it('renders correctly with initial data, global status Ativo and all sections', () => {
    render(
      <FinancialSettingsForm
        initialData={mockFinancialData}
        missionaryName="Samuel Mendonça"
      />
    );

    expect(
      screen.getByRole('heading', { name: /configurações financeiras/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/status: ativo/i)).toBeInTheDocument();
    expect(screen.getByText(/ambiente seguro/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockFinancialData.supporterMessage)).toBeInTheDocument();
    expect(screen.getByDisplayValue('missionario@email.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Banco do Brasil')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234-5')).toBeInTheDocument();

    const backButtons = screen.getAllByRole('link', { name: /voltar/i });
    expect(backButtons.length).toBeGreaterThanOrEqual(1);
    expect(backButtons[0]).toHaveAttribute('href', '/profile/sobre');
  });

  it('updates supporter message and character counter dynamically', async () => {
    const user = userEvent.setup();
    render(<FinancialSettingsForm initialData={mockFinancialData} />);

    const messageInput = screen.getByLabelText(/mensagem de gratidão e direcionamento/i);
    await user.clear(messageInput);
    await user.type(messageInput, 'Paz do Senhor a todos os mantenedores!');

    expect(messageInput).toHaveValue('Paz do Senhor a todos os mantenedores!');
    expect(screen.getByText(/38\/500 caracteres/i)).toBeInTheDocument();
  });

  it('shows pending status when all donation methods are disabled', async () => {
    render(
      <FinancialSettingsForm
        initialData={{
          ...mockFinancialData,
          pix: { ...mockFinancialData.pix, enabled: false },
          bankTransfer: { ...mockFinancialData.bankTransfer, enabled: false },
        }}
      />
    );

    expect(screen.getByText(/status: pendente/i)).toBeInTheDocument();
    expect(
      screen.getByText(/seus métodos de doação ainda constam como pendentes/i)
    ).toBeInTheDocument();
  });

  it('opens and closes supporter preview modal', async () => {
    const user = userEvent.setup();
    render(<FinancialSettingsForm initialData={mockFinancialData} />);

    const previewButtons = screen.getAllByRole('button', { name: /visualizar prévia/i });
    await user.click(previewButtons[0]);

    // Modal opens
    expect(screen.getByRole('heading', { name: /ofertar na missão/i })).toBeInTheDocument();
    expect(
      screen.getByText(/você está visualizando a experiência de oferta exatamente como seus apoiadores verão/i)
    ).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /fechar/i });
    await user.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /ofertar na missão/i })).not.toBeInTheDocument();
    });
  });

  it('allows removing static QR Code and submitting the form', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();

    render(
      <FinancialSettingsForm
        initialData={mockFinancialData}
        onSave={handleSave}
      />
    );

    // Click remove QR Code
    const removeQrBtn = screen.getByRole('button', { name: /remover/i });
    await user.click(removeQrBtn);
    expect(screen.getByText(/sem qr code/i)).toBeInTheDocument();

    // Submit form
    const saveBtn = screen.getByRole('button', { name: /salvar configurações/i });
    await user.click(saveBtn);

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        pix: expect.objectContaining({
          enabled: true,
          key: 'missionario@email.com',
          qrCodeUrl: undefined,
        }),
      })
    );

    expect(
      await screen.findByText(/configurações financeiras salvas com sucesso!/i)
    ).toBeInTheDocument();
  });
});
