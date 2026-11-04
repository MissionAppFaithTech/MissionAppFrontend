import { userAgentFromString } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import {
  DEVICE_COOKIE,
  deviceCookieMaxAge,
  deviceHeaders,
  deviceIdFor,
  deviceKindOf,
  deviceNameOf,
  readDeviceId,
  rememberDeviceId,
} from './device';

const UA = {
  windowsChrome:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  macSafari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  iphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  android:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  smartTv:
    'Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/4.0 Chrome/76.0.3809.146 TV Safari/537.36',
  bot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
};

const DEVICE_ID = '6f1c2a9e-4b7d-4e2a-9c3f-1d2e3f4a5b6c';

function jar(value?: string) {
  return {
    get: (name: string) => (name === DEVICE_COOKIE && value ? { value } : undefined),
    set: vi.fn(),
  };
}

describe('device kind', () => {
  it.each([
    [UA.windowsChrome, 'desktop'],
    [UA.macSafari, 'desktop'],
    [UA.iphone, 'mobile'],
    [UA.android, 'mobile'],
    [UA.ipad, 'tablet'],
    [UA.smartTv, 'unknown'],
    [UA.bot, 'unknown'],
  ])('%s → %s', (ua, kind) => {
    expect(deviceKindOf(userAgentFromString(ua))).toBe(kind);
  });
});

describe('device name', () => {
  it('names the browser and the system in Portuguese', () => {
    expect(deviceNameOf(userAgentFromString(UA.windowsChrome))).toBe('Chrome no Windows');
    expect(deviceNameOf(userAgentFromString(UA.iphone))).toBe('Mobile Safari no iOS');
  });

  it('uses only the browser when the system is unknown', () => {
    const agent = userAgentFromString(UA.windowsChrome);
    expect(deviceNameOf({ ...agent, os: {} })).toBe('Chrome');
  });

  it('has no name when the browser is unknown', () => {
    expect(deviceNameOf(userAgentFromString('curl/8.0'))).toBeUndefined();
  });

  it('stays within the 120 characters the API accepts', () => {
    const agent = userAgentFromString(UA.windowsChrome);
    const name = deviceNameOf({ ...agent, browser: { name: 'B'.repeat(200) } });
    expect(name).toHaveLength(120);
  });
});

describe('deviceHeaders', () => {
  it('sends the id, kind and name', () => {
    expect(deviceHeaders(new Headers({ 'user-agent': UA.android }), DEVICE_ID)).toEqual({
      'x-device-id': DEVICE_ID,
      'x-device-kind': 'mobile',
      'x-device-name': 'Chrome no Android',
    });
  });

  it('sends only an unknown kind without a user agent or id', () => {
    expect(deviceHeaders(new Headers(), undefined)).toEqual({ 'x-device-kind': 'unknown' });
  });
});

describe('device cookie', () => {
  it('is named ma_device_id (the browser keeps it across releases)', () => {
    expect(DEVICE_COOKIE).toBe('ma_device_id');
  });

  it('reads an id the API accepts', () => {
    expect(readDeviceId(jar(DEVICE_ID))).toBe(DEVICE_ID);
    expect(deviceIdFor(jar(DEVICE_ID))).toBe(DEVICE_ID);
  });

  it.each([['curto'], ['com espaço e acentuação!!'], ['a'.repeat(129)]])(
    'ignores a cookie the API would refuse: %s',
    (value) => {
      expect(readDeviceId(jar(value))).toBeUndefined();
    }
  );

  it('creates a random id when there is none', () => {
    const first = deviceIdFor(jar());
    const second = deviceIdFor(jar());
    expect(first).toMatch(/^[0-9a-f-]{36}$/);
    expect(first).not.toBe(second);
  });

  it('stores the id as an httpOnly cookie for 400 days', () => {
    const store = jar();
    rememberDeviceId(store, DEVICE_ID);
    expect(store.set).toHaveBeenCalledWith(
      DEVICE_COOKIE,
      DEVICE_ID,
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 400,
      })
    );
    expect(deviceCookieMaxAge).toBe(60 * 60 * 24 * 400);
  });
});
