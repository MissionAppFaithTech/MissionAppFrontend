export type AccessTokenClaims = {
  sub?: string;
  role?: string;
  exp?: number;
};

/**
 * Reads the JWT payload without verifying the signature.
 * Only for UI hints (role, expiry); the backend remains the authority.
 */
export function decodeAccessToken(token: string): AccessTokenClaims | null {
  const segment = token.split('.')[1];
  if (!segment) return null;

  try {
    const json = Buffer.from(segment, 'base64url').toString('utf8');
    const claims: unknown = JSON.parse(json);
    return typeof claims === 'object' && claims !== null ? (claims as AccessTokenClaims) : null;
  } catch {
    return null;
  }
}

/** True when the token expires within `skewSeconds`; a token without `exp` never expires here. */
export function isAccessTokenExpiring(token: string, skewSeconds = 10, now = Date.now()): boolean {
  const exp = decodeAccessToken(token)?.exp;
  if (typeof exp !== 'number') return false;
  return exp * 1000 <= now + skewSeconds * 1000;
}
