import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import StyledTextArea from './StyledTextArea';

describe('StyledTextArea', () => {
  it('associates the label with the textarea and types a value', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <StyledTextArea
        label="Sobre mim"
        value=""
        onChange={handleChange}
        placeholder="Escreva sua apresentação"
      />
    );

    const field = screen.getByLabelText(/sobre mim/i);
    expect(field).toBeInTheDocument();
    expect(field.tagName).toBe('TEXTAREA');
    expect(screen.queryByRole('button', { name: /desfazer alteração/i })).not.toBeInTheDocument();

    await user.type(field, 'Olá');
    expect(handleChange).toHaveBeenCalled();
  });

  it('links the error helper to the field and shows the character count', () => {
    render(
      <StyledTextArea label="Bio" value="abc" maxLength={10} error helperText="Informe uma bio" />
    );

    const field = screen.getByLabelText(/^bio:/i);
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription(/informe uma bio/i);
    expect(screen.getByText('3/10 caracteres')).toBeInTheDocument();
  });

  it('warns how many characters are left near the limit, without an alert yet', () => {
    render(<StyledTextArea label="Bio" value={'a'.repeat(65)} maxLength={70} />);

    expect(screen.getByText('65/70 caracteres · restam 5')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('turns red and explains the limit, in a live region, once it is reached', () => {
    render(<StyledTextArea label="Bio" value={'a'.repeat(70)} maxLength={70} />);

    const field = screen.getByLabelText(/^bio:/i);
    const message =
      'Você atingiu o limite de 70 caracteres. Para escrever algo novo, apague parte do texto.';
    expect(screen.getByRole('status')).toHaveTextContent(message);
    expect(field).toHaveAccessibleDescription(expect.stringContaining('Você atingiu o limite'));
    // Full is not invalid: the text can still be saved.
    expect(field).not.toHaveAttribute('aria-invalid');
  });

  it('removes the warning as soon as the text is shortened', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState('a'.repeat(10));
      return <StyledTextArea label="Bio" value={value} onChange={setValue} maxLength={10} />;
    }
    render(<Controlled />);

    expect(screen.getByRole('status')).toHaveTextContent(/atingiu o limite de 10/);
    await user.type(screen.getByLabelText(/^bio:/i), '{Backspace}');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
