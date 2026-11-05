import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ConfirmDialog from './ConfirmDialog';

const renderDialog = (props: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) => {
  const onCancel = vi.fn();
  const onConfirm = vi.fn();
  render(
    <ConfirmDialog
      open
      title="Descartar alterações?"
      description="Elas serão perdidas."
      cancelLabel="Continuar editando"
      confirmLabel="Descartar"
      onCancel={onCancel}
      onConfirm={onConfirm}
      {...props}
    />
  );
  return { onCancel, onConfirm };
};

describe('ConfirmDialog', () => {
  it('is labelled by its title, described by its text and focuses the safe choice', () => {
    renderDialog();

    const dialog = screen.getByRole('dialog', { name: 'Descartar alterações?' });
    expect(dialog).toHaveAccessibleDescription('Elas serão perdidas.');
    expect(screen.getByRole('button', { name: 'Continuar editando' })).toHaveFocus();
  });

  it('calls each action from its button', async () => {
    const user = userEvent.setup();
    const { onCancel, onConfirm } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Continuar editando' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape like the safe choice', async () => {
    const user = userEvent.setup();
    const { onCancel, onConfirm } = renderDialog();

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('cannot be dismissed while the action is running', async () => {
    const user = userEvent.setup();
    const { onCancel } = renderDialog({ loading: true });

    await user.keyboard('{Escape}');

    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Continuar editando' })).toBeDisabled();
  });
});
