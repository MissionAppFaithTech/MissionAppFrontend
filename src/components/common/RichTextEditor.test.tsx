import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import RichTextEditor from './RichTextEditor';

/** Expands a phrase into the sequence of values a textarea holds while it is typed. */
function buildKeystrokes(phrase: string): string[] {
  return Array.from({ length: phrase.length }, (_, i) => phrase.slice(0, i + 1));
}

describe('RichTextEditor component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders label and ergonomic toolbar with undo and redo controls, and without bold/italic', () => {
    render(
      <RichTextEditor
        label="Sobre mim"
        placeholder="Escreva sobre sua história..."
        defaultValue="Texto inicial"
        maxLength={500}
      />
    );

    expect(screen.getByText(/sobre mim/i)).toBeInTheDocument();
    expect(
      screen.getByRole('toolbar', { name: /ações e histórico de edição/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /desfazer alteração/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refazer alteração/i })).toBeInTheDocument();

    // Bold, Italic and List buttons should NOT be present
    expect(screen.queryByRole('button', { name: /^negrito$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^itálico$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /lista com marcadores/i })).not.toBeInTheDocument();

    // Character counter
    expect(screen.getByText('13/500 caracteres')).toBeInTheDocument();
  });

  it('displays error message when error prop and helperText are passed', () => {
    render(
      <RichTextEditor
        label="Histórico de Missões"
        error={true}
        helperText="Este campo é obrigatório para missionários"
      />
    );

    expect(screen.getByText('Este campo é obrigatório para missionários')).toBeInTheDocument();
  });

  it('opens help modal with shortcuts and senior-friendly tips (Ctrl+Z, Ctrl+Y, Ctrl+C, Ctrl+V)', () => {
    render(<RichTextEditor label="Testemunho" />);

    const helpButton = screen.getByRole('button', {
      name: /ajuda e atalhos de escrita para missionários/i,
    });
    fireEvent.click(helpButton);

    expect(screen.getByText(/como usar o desfazer e refazer/i)).toBeInTheDocument();
    expect(screen.getByText(/no celular ou tablet/i)).toBeInTheDocument();
    expect(screen.getByText(/no computador/i)).toBeInTheDocument();
    expect(screen.getByText('Ctrl + Z')).toBeInTheDocument();
    expect(screen.getByText('Ctrl + Y')).toBeInTheDocument();
    expect(screen.getByText('Ctrl + C')).toBeInTheDocument();
    expect(screen.getByText('Ctrl + V')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /entendido/i });
    fireEvent.click(closeBtn);
  });

  it('shows draft recovery notice when an existing draft is found in localStorage and allows restoring or dismissing', () => {
    localStorage.setItem('draft_test_mission_about', 'Rascunho recuperado do campo');

    render(
      <RichTextEditor label="Sobre" draftKey="test_mission_about" defaultValue="Texto original" />
    );

    expect(
      screen.getByText(/existe um rascunho salvo anteriormente deste texto no seu aparelho/i)
    ).toBeInTheDocument();
    const restoreButton = screen.getByRole('button', { name: /restaurar rascunho/i });
    expect(restoreButton).toBeInTheDocument();

    // Test restoring draft
    fireEvent.click(restoreButton);
    expect(
      screen.queryByText(/existe um rascunho salvo anteriormente deste texto no seu aparelho/i)
    ).not.toBeInTheDocument();
  });

  it('allows dismissing draft recovery notice without restoring', () => {
    localStorage.setItem('draft_test_mission_dismiss', 'Rascunho a descartar');

    render(
      <RichTextEditor label="Sobre" draftKey="test_mission_dismiss" defaultValue="Texto original" />
    );

    const dismissButtons = screen.getAllByRole('button', { name: /descartar aviso de rascunho/i });
    expect(dismissButtons.length).toBeGreaterThan(0);

    fireEvent.click(dismissButtons[0]);
    expect(
      screen.queryByText(/existe um rascunho salvo anteriormente deste texto no seu aparelho/i)
    ).not.toBeInTheDocument();
  });

  it('undoes one whole word at a time, not one character', () => {
    render(<RichTextEditor label="Mensagem" />);

    const editor = screen.getByRole('textbox');
    // one event per keystroke, the way a person types
    for (const value of buildKeystrokes('Deus abencoe a missao')) {
      fireEvent.change(editor, { target: { value } });
    }
    expect(editor).toHaveValue('Deus abencoe a missao');

    const undo = screen.getByRole('button', { name: /desfazer alteração/i });

    fireEvent.click(undo);
    expect(editor).toHaveValue('Deus abencoe a ');

    fireEvent.click(undo);
    expect(editor).toHaveValue('Deus abencoe ');

    fireEvent.click(undo);
    expect(editor).toHaveValue('Deus ');

    fireEvent.click(undo);
    expect(editor).toHaveValue('');
  });

  it('redoes a word at a time as well', () => {
    render(<RichTextEditor label="Mensagem" />);

    const editor = screen.getByRole('textbox');
    for (const value of buildKeystrokes('Paz e bem')) {
      fireEvent.change(editor, { target: { value } });
    }

    const undo = screen.getByRole('button', { name: /desfazer alteração/i });
    const redo = screen.getByRole('button', { name: /refazer alteração/i });

    fireEvent.click(undo);
    fireEvent.click(undo);
    expect(editor).toHaveValue('Paz ');

    fireEvent.click(redo);
    expect(editor).toHaveValue('Paz e ');
  });

  it('treats a paste as a single undo step', () => {
    render(<RichTextEditor label="Mensagem" />);

    const editor = screen.getByRole('textbox');
    for (const value of buildKeystrokes('Ola ')) {
      fireEvent.change(editor, { target: { value } });
    }
    // a paste arrives as one change carrying many characters
    fireEvent.change(editor, { target: { value: 'Ola mundo inteiro de uma vez' } });

    fireEvent.click(screen.getByRole('button', { name: /desfazer alteração/i }));
    expect(editor).toHaveValue('Ola ');
  });
});
