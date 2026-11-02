import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FeedbackToast, { FEEDBACK_TOAST_DURATION_MS } from './FeedbackToast';
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

  it('names the severity in text, not only with color', () => {
    render(<FeedbackToast />);

    act(() => useFeedbackStore.getState().notify('Salvo.'));
    expect(screen.getByRole('status')).toHaveTextContent('Tudo certo');

    act(() => useFeedbackStore.getState().notify('Nenhuma alteração para salvar.', 'info'));
    expect(screen.getByRole('status')).toHaveTextContent('Aviso');

    act(() => useFeedbackStore.getState().notify('Falhou.', 'error'));
    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado');
  });

  it('is polite for success and assertive for errors', () => {
    render(<FeedbackToast />);

    act(() => useFeedbackStore.getState().notify('Salvo.'));
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');

    act(() => useFeedbackStore.getState().notify('Falhou.', 'error'));
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });

  it('closes with Escape but not with a click elsewhere on the page', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Outro</button>
        <FeedbackToast />
      </>
    );
    act(() => useFeedbackStore.getState().notify('Salvo.'));

    await user.click(screen.getByRole('button', { name: 'Outro' }));
    expect(useFeedbackStore.getState().current?.message).toBe('Salvo.');

    await user.keyboard('{Escape}');
    expect(useFeedbackStore.getState().current).toBeNull();
  });

  describe('auto hide', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('dismisses itself after the reading time', () => {
      render(<FeedbackToast />);
      act(() => useFeedbackStore.getState().notify('Salvo.'));

      act(() => vi.advanceTimersByTime(FEEDBACK_TOAST_DURATION_MS - 100));
      expect(useFeedbackStore.getState().current).not.toBeNull();

      act(() => vi.advanceTimersByTime(200));
      expect(useFeedbackStore.getState().current).toBeNull();
    });
  });
});
