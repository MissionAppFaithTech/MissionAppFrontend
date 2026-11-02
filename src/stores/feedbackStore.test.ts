import { beforeEach, describe, expect, it } from 'vitest';
import { useFeedbackStore } from './feedbackStore';

describe('feedbackStore', () => {
  beforeEach(() => {
    useFeedbackStore.setState(useFeedbackStore.getInitialState(), true);
  });

  it('starts without a message', () => {
    expect(useFeedbackStore.getState().current).toBeNull();
  });

  it('notify defaults to the success severity', () => {
    useFeedbackStore.getState().notify('Perfil salvo');

    expect(useFeedbackStore.getState().current).toMatchObject({
      message: 'Perfil salvo',
      severity: 'success',
    });
  });

  it.each(['error', 'info'] as const)('notify accepts the %s severity', (severity) => {
    useFeedbackStore.getState().notify('Mensagem', severity);
    expect(useFeedbackStore.getState().current?.severity).toBe(severity);
  });

  it('gives every notification a new id so repeated messages re-trigger the toast', () => {
    useFeedbackStore.getState().notify('Salvo');
    const first = useFeedbackStore.getState().current!;
    useFeedbackStore.getState().notify('Salvo');
    const second = useFeedbackStore.getState().current!;

    expect(second.message).toBe(first.message);
    expect(second.id).toBeGreaterThan(first.id);
  });

  it('a new notification replaces the current one', () => {
    useFeedbackStore.getState().notify('Primeira', 'info');
    useFeedbackStore.getState().notify('Segunda', 'error');

    expect(useFeedbackStore.getState().current).toMatchObject({
      message: 'Segunda',
      severity: 'error',
    });
  });

  it('dismiss clears the current message', () => {
    useFeedbackStore.getState().notify('Salvo');
    useFeedbackStore.getState().dismiss();
    expect(useFeedbackStore.getState().current).toBeNull();
  });
});
