import { describe, it, expect, vi } from 'vitest';
import { yieldToMain } from './scheduler';

describe('yieldToMain utility', () => {
  it('resolves cleanly in standard environment using setTimeout fallback', async () => {
    const start = performance.now();
    await yieldToMain();
    expect(performance.now()).toBeGreaterThanOrEqual(start);
  });

  it('calls window.scheduler.yield when available', async () => {
    const mockYield = vi.fn().mockResolvedValue(undefined);
    const originalScheduler = (window as unknown as { scheduler?: unknown }).scheduler;

    Object.defineProperty(window, 'scheduler', {
      value: { yield: mockYield },
      writable: true,
      configurable: true,
    });

    await yieldToMain();
    expect(mockYield).toHaveBeenCalledTimes(1);

    Object.defineProperty(window, 'scheduler', {
      value: originalScheduler,
      writable: true,
      configurable: true,
    });
  });
});
