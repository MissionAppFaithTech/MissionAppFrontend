import { describe, expect, it } from 'vitest';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useSupporterRegisterStore } from '@/stores/supporterRegisterStore';

// The two tests run in order: the second proves the zustand mock
// (__mocks__/zustand.ts) put every store back to its initial state.
describe('zustand stores between tests', () => {
  it('lets a test change store state and replace actions', () => {
    useFeedbackStore.getState().notify('Salvo.');
    useSupporterRegisterStore.setState({ step: 3, reset: () => {} });

    expect(useFeedbackStore.getState().current?.message).toBe('Salvo.');
    expect(useSupporterRegisterStore.getState().step).toBe(3);
  });

  it('starts the next test from the initial state, with the real actions back', () => {
    expect(useFeedbackStore.getState().current).toBeNull();
    expect(useSupporterRegisterStore.getState().step).toBe(1);
    expect(useSupporterRegisterStore.getState().reset).toBe(
      useSupporterRegisterStore.getInitialState().reset
    );
  });
});
