import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CampaignQrCode from './CampaignQrCode';

const campaign = { id: 'campanha-teste', title: 'Campanha Teste' };

describe('CampaignQrCode', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,QR');
  });
  afterEach(() => vi.restoreAllMocks());

  it('encodes the absolute URL of the campaign page, with an accessible name', () => {
    render(<CampaignQrCode campaign={campaign} />);

    expect(
      screen.getByRole('img', { name: 'QR Code que abre a página da campanha Campanha Teste' })
    ).toBeInTheDocument();
    expect(screen.getByText('http://localhost:3000/campanha/campanha-teste')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Abrir a página da campanha' })).toHaveAttribute(
      'href',
      '/campanha/campanha-teste'
    );
  });

  it('downloads the QR code as a PNG named after the campaign', async () => {
    const user = userEvent.setup();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<CampaignQrCode campaign={campaign} />);

    await user.click(screen.getByRole('button', { name: 'Baixar QR Code (PNG)' }));

    expect(click).toHaveBeenCalledTimes(1);
    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe('qr-code-campanha-teste.png');
    expect(link.href).toBe('data:image/png;base64,QR');
  });
});
