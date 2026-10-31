import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import FeedbackToast from './FeedbackToast';
import { useFeedbackStore } from '@/stores/feedbackStore';

describe('FeedbackToast', () => {
  beforeEach(() => useFeedbackStore.setState({ current: null }));

  it('announces success politely and errors assertively', () => {
    render(<FeedbackToast />);

    act(() => useFeedbackStore.getState().notify('Perfil atualizado.'));
    expect(screen.getByRole('status')).toHaveTextContent('Perfil atualizado.');

    act(() => useFeedbackStore.getState().notify('Falhou.', 'error'));
    expect(screen.getByRole('alert')).toHaveTextContent('Falhou.');
  });

  it('can be dismissed with its labelled close button', async () => {
    const user = userEvent.setup();
    render(<FeedbackToast />);
    act(() => useFeedbackStore.getState().notify('Salvo.'));

    await user.click(screen.getByRole('button', { name: /fechar aviso/i }));

    expect(useFeedbackStore.getState().current).toBeNull();
  });
});
