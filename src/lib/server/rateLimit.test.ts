import { beforeEach, describe, expect, it } from 'vitest';
import { consumeRateLimit, resetRateLimits } from './rateLimit';

describe('consumeRateLimit', () => {
  beforeEach(() => resetRateLimits());

  it('allows up to the limit in a window, then refuses with the seconds left', () => {
    const now = 1_000_000;
    expect(consumeRateLimit('k', 2, 60_000, now)).toEqual({ allowed: true, retryAfterSeconds: 60 });
    expect(consumeRateLimit('k', 2, 60_000, now + 1)).toMatchObject({ allowed: true });
    expect(consumeRateLimit('k', 2, 60_000, now + 30_000)).toEqual({
      allowed: false,
      retryAfterSeconds: 30,
    });
  });

  it('starts a new window once the previous one ends', () => {
    const now = 1_000_000;
    consumeRateLimit('k', 1, 1_000, now);
    expect(consumeRateLimit('k', 1, 1_000, now + 500).allowed).toBe(false);
    expect(consumeRateLimit('k', 1, 1_000, now + 1_000).allowed).toBe(true);
  });

  it('counts each key on its own', () => {
    consumeRateLimit('a', 1, 60_000, 0);
    expect(consumeRateLimit('a', 1, 60_000, 0).allowed).toBe(false);
    expect(consumeRateLimit('b', 1, 60_000, 0).allowed).toBe(true);
  });

  it('never reports less than one second to wait', () => {
    consumeRateLimit('k', 1, 1_000, 0);
    expect(consumeRateLimit('k', 1, 1_000, 999)).toEqual({ allowed: false, retryAfterSeconds: 1 });
  });

  it('at the key cap, drops only the expired windows and keeps counting the live ones', () => {
    // Half of the windows end at 10, half are still live (and spent) at 10.
    for (let index = 0; index < 5_000; index += 1) consumeRateLimit(`old-${index}`, 1, 10, 0);
    for (let index = 0; index < 5_000; index += 1) consumeRateLimit(`live-${index}`, 1, 60_000, 0);

    // A new key at the cap sweeps: the window that ends exactly now counts as expired.
    expect(consumeRateLimit('new', 1, 60_000, 10).allowed).toBe(true);

    // Live windows survived the sweep (no clear-all), so they are still spent.
    expect(consumeRateLimit('live-0', 1, 60_000, 10).allowed).toBe(false);
    expect(consumeRateLimit('live-4999', 1, 60_000, 10).allowed).toBe(false);
    expect(consumeRateLimit('old-0', 1, 10, 10).allowed).toBe(true);
  });

  it('below the key cap, never forgets a live window', () => {
    consumeRateLimit('a', 1, 60_000, 0);
    for (let index = 0; index < 100; index += 1) consumeRateLimit(`k-${index}`, 1, 1, 0);

    expect(consumeRateLimit('a', 1, 60_000, 5).allowed).toBe(false);
  });

  it('clears everything when the tracked keys are still live', () => {
    for (let index = 0; index < 10_000; index += 1) consumeRateLimit(`ip-${index}`, 1, 60_000, 0);
    expect(consumeRateLimit('new', 1, 60_000, 1).allowed).toBe(true);
    expect(consumeRateLimit('ip-0', 1, 60_000, 1).allowed).toBe(true);
  });
});
