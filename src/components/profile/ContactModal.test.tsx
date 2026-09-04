import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ContactModal from '@/components/profile/ContactModal';

describe('ContactModal Component', () => {
  const mockContact = {
    publicEmail: 'samuelhe@gmail.com',
    publicPhone: '+55 (21) 98765-4321',
    whatsappNumber: '+5521987654321',
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

    await user.click(copyButtons[1]);
    expect(writeTextSpy).toHaveBeenCalledWith(mockContact.publicEmail);
  });

  it('renders "Editar contatos públicos" shortcut when isOwnProfile is true', () => {
    render(
      <ContactModal open={true} onClose={vi.fn()} contact={mockContact} isOwnProfile={true} />
    );

    const editShortcut = screen.getByRole('link', { name: /editar contatos públicos/i });
    expect(editShortcut).toBeInTheDocument();
    expect(editShortcut).toHaveAttribute('href', '/profile/edit-profile');
  });
});
