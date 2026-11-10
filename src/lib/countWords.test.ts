import { describe, expect, it } from 'vitest';
import { countWords } from './countWords';

describe('countWords', () => {
  it('counts words split by any whitespace', () => {
    expect(countWords('um dois\ntrês\t quatro')).toBe(4);
  });
  it('is 0 for blank text', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('  \n ')).toBe(0);
  });
  it('ignores surrounding whitespace', () => {
    expect(countWords('  olá mundo  ')).toBe(2);
  });
});
