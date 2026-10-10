import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, it, expect } from 'vitest';
import PublicContactFields, { type PublicContactFormValues } from './PublicContactFields';

const defaults: PublicContactFormValues = {
  publicEmail: 'samuelhe@gmail.com',
  publicPhone: '+5521987654321',
  showPublicEmail: true,
  showPublicPhone: true,
  allowWhatsappContact: true,
};

function Harness({ initial = defaults }: { initial?: PublicContactFormValues }) {
  const { control, formState } = useForm<PublicContactFormValues>({
    defaultValues: initial,
  });

  return <PublicContactFields control={control} errors={formState.errors} />;
}

describe('PublicContactFields', () => {
  it('renders email and phone like outlined contact fields plus visibility checkboxes', () => {
    render(<Harness />);

    expect(screen.getByRole('heading', { name: /informações de contato/i })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      /essas informações serão exibidas publicamente para visitantes e apoiadores/i
    );
    expect(screen.getByLabelText(/^e-mail:$/i)).toHaveValue('samuelhe@gmail.com');
    expect(screen.getByLabelText(/^telefone:$/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /país do telefone/i })).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /exibir e-mail no meu perfil/i })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /exibir telefone no meu perfil/i })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /este número é um número de whatsapp/i })
    ).toBeChecked();
  });

  it('toggles the public email, phone and whatsapp checkboxes', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const showEmail = screen.getByRole('checkbox', {
      name: /exibir e-mail no meu perfil/i,
    });
    const showPhone = screen.getByRole('checkbox', {
      name: /exibir telefone no meu perfil/i,
    });
    const allowWhatsapp = screen.getByRole('checkbox', {
      name: /este número é um número de whatsapp/i,
    });

    await user.click(showEmail);
    await user.click(showPhone);
    await user.click(allowWhatsapp);

    expect(showEmail).not.toBeChecked();
    expect(showPhone).not.toBeChecked();
    expect(allowWhatsapp).not.toBeChecked();
  });
});
