import { userAgentFromString } from 'next/server';
import { authCookieOptions, type CookieWriter } from '@/lib/auth/cookies';

/**
 * Device cookie (ADR-0007): a random id that tells the API "this is the same
 * browser" so a new login replaces the previous session instead of adding one
 * (ADR-0038 do backend). It identifies the browser, not the session, so logout
 * keeps it.
 */
export const DEVICE_COOKIE = 'ma_device_id';

/** Browsers cap cookie lifetime at 400 days. */
export const deviceCookieMaxAge = 60 * 60 * 24 * 400;

export type DeviceKind = 'desktop' | 'mobile' | 'tablet' | 'unknown';

/** Same limit as the backend's `x-device-name`. */
const DEVICE_NAME_MAX_LENGTH = 120;

/** Accepted by the backend: 16 to 128 characters of `[A-Za-z0-9_-]`. */
const DEVICE_ID_PATTERN = /^[\w-]{16,128}$/;

type CookieReader = { get(name: string): { value: string } | undefined };

/** The stored device id, when it is one the backend accepts. */
export function readDeviceId(jar: CookieReader): string | undefined {
  const value = jar.get(DEVICE_COOKIE)?.value;
  return value && DEVICE_ID_PATTERN.test(value) ? value : undefined;
}

/** The browser's device id, or a new one when it has none yet. */
export function deviceIdFor(jar: CookieReader): string {
  return readDeviceId(jar) ?? crypto.randomUUID();
}

/**
 * Stores the device id after a successful login or signup, so a failed attempt
 * sets no cookie. Writing it again restarts its lifetime.
 */
export function rememberDeviceId(jar: CookieWriter, deviceId: string) {
  jar.set(DEVICE_COOKIE, deviceId, { ...authCookieOptions, maxAge: deviceCookieMaxAge });
}

type ParsedUserAgent = ReturnType<typeof userAgentFromString>;

/** ua-parser leaves `device.type` empty for computers. */
export function deviceKindOf(agent: ParsedUserAgent): DeviceKind {
  if (agent.isBot) return 'unknown';
  if (agent.device.type === 'mobile' || agent.device.type === 'tablet') return agent.device.type;
  return agent.device.type ? 'unknown' : 'desktop';
}

/** "Chrome no Windows"; undefined when the browser cannot be told. */
export function deviceNameOf(agent: ParsedUserAgent): string | undefined {
  const { browser, os } = agent;
  if (!browser.name) return undefined;
  const name = os.name ? `${browser.name} no ${os.name}` : browser.name;
  return name.slice(0, DEVICE_NAME_MAX_LENGTH);
}

/**
 * Headers that describe the user's device to the API on login, signup and
 * refresh. Every refresh path must send them: the backend copies the name of
 * each request into the new token and uses it to spot replays.
 */
export function deviceHeaders(
  incoming: Pick<Headers, 'get'>,
  deviceId: string | undefined
): Record<string, string> {
  // NOTE: without a user agent the parser falls back to `window.navigator`; never use it.
  const ua = incoming.get('user-agent');
  const agent = ua ? userAgentFromString(ua) : undefined;
  const name = agent ? deviceNameOf(agent) : undefined;
  return {
    'x-device-kind': agent ? deviceKindOf(agent) : 'unknown',
    ...(name ? { 'x-device-name': name } : {}),
    ...(deviceId ? { 'x-device-id': deviceId } : {}),
  };
}
