import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import DonationModal from '@/components/profile/DonationModal';

describe('DonationModal Component', () => {
  it('renders modal title, message, and defaults to Pix tab', () => {
    render(
      <DonationModal
        open={true}
        onClose={vi.fn()}
        missionaryName="Samuel Mendonça"
        isOwnProfile={false}
      />
    );

    expect(screen.getByRole('heading', { name: /ofertar na missão/i })).toBeInTheDocument();
    expect(screen.getByText(/mensagem aos apoiadores/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copiar chave pix/i })).toBeInTheDocument();
  });

  it('switches to bank transfer tab and allows copying bank data', async () => {
    const user = userEvent.setup();
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      configurable: true,
    });

    render(
      <DonationModal
        open={true}
        onClose={vi.fn()}
        missionaryName="Samuel Mendonça"
        isOwnProfile={false}
      />
    );

    const bankTab = screen.getByRole('tab', { name: /transferência bancária/i });
    await user.click(bankTab);

    expect(screen.getByText(/dados da conta para transferência/i)).toBeInTheDocument();
    expect(screen.getByText(/banco santander/i)).toBeInTheDocument();

    const copyAllBtn = screen.getByRole('button', { name: /copiar todos os dados bancários/i });
    await user.click(copyAllBtn);
    expect(writeTextSpy).toHaveBeenCalledWith(
      expect.stringContaining('Dados Bancários de Samuel Mendonça')
    );
  });

  it('shows owner preview indicator when isOwnProfile is true', () => {
    render(
      <DonationModal
        open={true}
        onClose={vi.fn()}
        missionaryName="Samuel Mendonça"
        isOwnProfile={true}
      />
    );

    expect(
      screen.getByText(
        /você está visualizando a experiência de oferta exatamente como seus apoiadores verão/i
      )
    ).toBeInTheDocument();
  });

  it('renders custom financialConfig supporter message and pix details', () => {
    render(
      <DonationModal
        open={true}
        onClose={vi.fn()}
        missionaryName="Samuel Mendonça"
        financialConfig={{
          supporterMessage: 'Mensagem customizada de gratidão aos irmãos!',
          pix: {
            enabled: true,
            key: 'custom-pix@test.com',
            keyType: 'email',
          },
          bankTransfer: {
            enabled: false,
            bankName: '',
            bankNumber: '',
            agency: '',
            account: '',
            accountType: 'corrente',
            holderName: '',
            holderDocument: '',
          },
        }}
      />
    );

    expect(
      screen.getByText(/mensagem customizada de gratidão aos irmãos!/i)
    ).toBeInTheDocument();
    expect(screen.getByText('custom-pix@test.com')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /transferência bancária/i })).not.toBeInTheDocument();
  });
});
