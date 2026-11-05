import { describe, expect, it } from 'vitest';
import { normalizeCatalogTerm } from './search';

describe('normalizeCatalogTerm', () => {
  it.each([
    ['  Missões   SÃO  ', 'missoes sao'],
    ['JOCUM', 'jocum'],
    ['Igreja\tda\n Paz', 'igreja da paz'],
    ['Açaí Ñandú', 'acai nandu'],
    ['', ''],
  ])('normalizes %j to %j, like the backend catalog_normalize', (input, expected) => {
    expect(normalizeCatalogTerm(input)).toBe(expected);
  });
});
