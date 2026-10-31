import { describe, expect, it } from 'vitest';
import { decodeAccessToken, isAccessTokenExpiring } from '@/lib/auth/jwt';

const b64url = (value: string) => Buffer.from(value).toString('base64url');
const jwt = (claims: Record<string, unknown>) =>
  `${b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64url(JSON.stringify(claims))}.sig`;

const NOW = Date.UTC(2026, 9, 30, 12, 0, 0);
const nowSeconds = NOW / 1000;

describe('decodeAccessToken', () => {
  it('returns null when the payload is valid JSON but not an object', () => {
    const payload = Buffer.from('5').toString('base64url');
    expect(decodeAccessToken(`h.${payload}.s`)).toBeNull();
    expect(decodeAccessToken(`h.${Buffer.from('null').toString('base64url')}.s`)).toBeNull();
  });

  it('returns the payload claims', () => {
    expect(decodeAccessToken(jwt({ sub: 'usr-1', role: 'SUPPORTER', exp: 123 }))).toEqual({
      sub: 'usr-1',
      role: 'SUPPORTER',
      exp: 123,
    });
  });

  it('decodes base64url payloads containing URL-safe characters', () => {
    // "~~~" encodes to "fn5-" in base64url (would be "fn5+" in base64).
    const token = jwt({ sub: '~~~', name: 'Ç?>' });
    expect(token.split('.')[1]).toMatch(/[-_]/);
    expect(decodeAccessToken(token)?.sub).toBe('~~~');
  });

  it('returns null when the token has no payload segment', () => {
    expect(decodeAccessToken('')).toBeNull();
    expect(decodeAccessToken('only-header')).toBeNull();
    expect(decodeAccessToken('header.')).toBeNull();
  });

  it('returns null when the payload is not JSON', () => {
    expect(decodeAccessToken(`h.${b64url('not json')}.s`)).toBeNull();
  });

  it('returns null when the payload is JSON but not an object', () => {
    expect(decodeAccessToken(`h.${b64url('42')}.s`)).toBeNull();
    expect(decodeAccessToken(`h.${b64url('null')}.s`)).toBeNull();
    expect(decodeAccessToken(`h.${b64url('"text"')}.s`)).toBeNull();
  });
});

describe('isAccessTokenExpiring', () => {
  it('is false when the token expires after the skew window', () => {
    expect(isAccessTokenExpiring(jwt({ exp: nowSeconds + 60 }), 10, NOW)).toBe(false);
  });

  it('is true when the token expires within the skew window', () => {
    expect(isAccessTokenExpiring(jwt({ exp: nowSeconds + 5 }), 10, NOW)).toBe(true);
  });

  it('is true exactly at the skew boundary', () => {
    expect(isAccessTokenExpiring(jwt({ exp: nowSeconds + 10 }), 10, NOW)).toBe(true);
    expect(isAccessTokenExpiring(jwt({ exp: nowSeconds + 11 }), 10, NOW)).toBe(false);
  });

  it('is true when the token already expired', () => {
    expect(isAccessTokenExpiring(jwt({ exp: nowSeconds - 1 }), 10, NOW)).toBe(true);
  });

  it('honours a custom skew', () => {
    const token = jwt({ exp: nowSeconds + 30 });
    expect(isAccessTokenExpiring(token, 0, NOW)).toBe(false);
    expect(isAccessTokenExpiring(token, 60, NOW)).toBe(true);
  });

  it('defaults to a 10s skew and the current time', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(isAccessTokenExpiring(jwt({ exp: now + 5 }))).toBe(true);
    expect(isAccessTokenExpiring(jwt({ exp: now + 120 }))).toBe(false);
  });

  it('is false when the token has no numeric exp (backend stays the authority)', () => {
    expect(isAccessTokenExpiring(jwt({ sub: 'usr-1' }), 10, NOW)).toBe(false);
    expect(isAccessTokenExpiring(jwt({ exp: String(nowSeconds - 100) }), 10, NOW)).toBe(false);
  });

  it('is false for an undecodable token', () => {
    expect(isAccessTokenExpiring('garbage', 10, NOW)).toBe(false);
  });
});
