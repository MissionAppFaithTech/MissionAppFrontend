import { renderHook } from '@testing-library/react';
import { StrictMode, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useRestartFinishedRegistration } from './useRestartFinishedRegistration';

const strict = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>;

describe('useRestartFinishedRegistration', () => {
  it('keeps the steps as they are while the wizard is in progress', () => {
    const reset = vi.fn();
    const { result, rerender } = renderHook(
      ({ step }) => useRestartFinishedRegistration(step, 4, reset),
      { initialProps: { step: 2 }, wrapper: strict }
    );
    expect(result.current).toBe(2);

    // Finishing while the wizard is open shows the final screen, without a reset.
    rerender({ step: 4 });
    expect(result.current).toBe(4);
    expect(reset).not.toHaveBeenCalled();
  });

  it('starts over at step 1 when opened on the final step, then follows the store', () => {
    const reset = vi.fn();
    const { result, rerender } = renderHook(
      ({ step }) => useRestartFinishedRegistration(step, 4, reset),
      { initialProps: { step: 4 } }
    );

    expect(result.current).toBe(1);
    expect(reset).toHaveBeenCalled();

    // The reset reached the store: the wizard works normally again.
    rerender({ step: 1 });
    rerender({ step: 3 });
    expect(result.current).toBe(3);
    rerender({ step: 4 });
    expect(result.current).toBe(4);
  });

  it('works with any final step (supporters finish on step 3)', () => {
    const reset = vi.fn();
    const { result } = renderHook(() => useRestartFinishedRegistration(3, 3, reset));

    expect(result.current).toBe(1);
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
