import { describe, expect, it } from 'vitest';
import { phoneDigits, samePhone } from './profile.schema';

describe('samePhone', () => {
  it('ignores formatting', () => {
    expect(samePhone('+55 (21) 98765-4321', '+5521987654321')).toBe(true);
    expect(phoneDigits('+55 (21) 98765-4321')).toBe('5521987654321');
  });

  it('tells different numbers apart', () => {
    expect(samePhone('+5521987654321', '+5521987654320')).toBe(false);
    expect(samePhone('+5521987654321', '')).toBe(false);
    expect(samePhone('', '+5521987654321')).toBe(false);
  });

  it('treats a bare country code (up to 3 digits) as no phone', () => {
    expect(samePhone('+55', '')).toBe(true);
    expect(samePhone('+351', undefined)).toBe(true);
    expect(samePhone(undefined, '+1')).toBe(true);
    expect(samePhone('+3512', '')).toBe(false);
    expect(samePhone('+55', '+351')).toBe(true);
  });
});
