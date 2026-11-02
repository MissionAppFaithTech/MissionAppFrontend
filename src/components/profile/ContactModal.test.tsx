import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContactModal from '@/components/profile/ContactModal';
import { useFeedbackStore } from '@/stores/feedbackStore';

describe('ContactModal Component', () => {
  beforeEach(() => {
    useFeedbackStore.setState({ current: null });
  });

  const mockContact = {
    publicEmail: 'samuelhe@gmail.com',
    publicPhone: '+55 (21) 98765-4321',
    whatsappNumber: '+5521987654321',
    allowWhatsappContact: true,
  };

  it('renders title, WhatsApp and E-mail public information', () => {
    render(
      <ContactModal open={true} onClose={vi.fn()} contact={mockContact} isOwnProfile={false} />
    );

    expect(screen.getByRole('heading', { name: /contato/i })).toBeInTheDocument();
    expect(screen.getByText('+55 (21) 98765-4321')).toBeInTheDocument();
    expect(screen.getByText('samuelhe@gmail.com')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /conversar/i })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/5521987654321')
    );
  });

  it('copies telephone and email to clipboard on button click', async () => {
    const user = userEvent.setup();
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      configurable: true,
    });

    render(
      <ContactModal open={true} onClose={vi.fn()} contact={mockContact} isOwnProfile={false} />
    );

    const copyButtons = screen.getAllByRole('button', { name: /copiar/i });
    expect(copyButtons.length).toBeGreaterThanOrEqual(2);

    await user.click(copyButtons[0]);
    expect(writeTextSpy).toHaveBeenCalledWith(mockContact.publicPhone);
    expect(useFeedbackStore.getState().current).toMatchObject({
      message: 'Telefone copiado para a área de transferência!',
      severity: 'success',
    });

    await user.click(copyButtons[1]);
    expect(writeTextSpy).toHaveBeenCalledWith(mockContact.publicEmail);
    expect(useFeedbackStore.getState().current?.message).toBe(
      'E-mail copiado para a área de transferência!'
    );
  });

  it('hides the public email when showPublicEmail is false', () => {
    render(
      <ContactModal
        open={true}
        onClose={vi.fn()}
        contact={{ ...mockContact, showPublicEmail: false }}
        isOwnProfile={false}
      />
    );

    expect(screen.getByText('+55 (21) 98765-4321')).toBeInTheDocument();
    expect(screen.queryByText('samuelhe@gmail.com')).not.toBeInTheDocument();
    expect(screen.queryByText(/e-mail público/i)).not.toBeInTheDocument();
  });

  it('renders "Editar contatos públicos" shortcut when isOwnProfile is true', () => {
    render(
      <ContactModal open={true} onClose={vi.fn()} contact={mockContact} isOwnProfile={true} />
    );

    const editShortcut = screen.getByRole('link', { name: /editar contatos públicos/i });
    expect(editShortcut).toBeInTheDocument();
    expect(editShortcut).toHaveAttribute('href', '/profile/edit-profile');
  });

  it('shows a plain phone without the WhatsApp action when the number is not WhatsApp', () => {
    render(
      <ContactModal
        open={true}
        onClose={vi.fn()}
        contact={{ publicEmail: '', publicPhone: '+5521987654321', allowWhatsappContact: false }}
      />
    );

    expect(screen.getByText('Telefone')).toBeInTheDocument();
    expect(screen.queryByText('Telefone e WhatsApp')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /conversar/i })).not.toBeInTheDocument();
  });

  it('treats an unanswered WhatsApp question as not WhatsApp', () => {
    render(
      <ContactModal
        open={true}
        onClose={vi.fn()}
        contact={{ publicEmail: '', publicPhone: '+5521987654321' }}
      />
    );

    expect(screen.queryByRole('link', { name: /conversar/i })).not.toBeInTheDocument();
  });

  it('labels a confirmed WhatsApp number and links to it', () => {
    render(<ContactModal open={true} onClose={vi.fn()} contact={mockContact} />);

    expect(screen.getByText('Telefone e WhatsApp')).toBeInTheDocument();
  });
});
