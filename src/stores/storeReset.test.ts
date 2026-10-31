import { describe, expect, it } from 'vitest';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useSessionStore } from '@/stores/sessionStore';

// The two tests run in order: the second proves the zustand mock
// (__mocks__/zustand.ts) put every store back to its initial state.
describe('zustand stores between tests', () => {
  it('lets a test change store state and replace actions', () => {
    useFeedbackStore.getState().notify('Salvo.');
    useSessionStore.setState({
      status: 'authenticated',
      role: 'ADMIN',
      loadSession: async () => 'authenticated',
    });

    expect(useFeedbackStore.getState().current?.message).toBe('Salvo.');
    expect(useSessionStore.getState().role).toBe('ADMIN');
  });

  it('starts the next test from the initial state, with the real actions back', () => {
    expect(useFeedbackStore.getState().current).toBeNull();
    expect(useSessionStore.getState()).toMatchObject({ status: 'unknown', role: null });
    expect(useSessionStore.getState().loadSession).toBe(
      useSessionStore.getInitialState().loadSession
    );
  });
});
