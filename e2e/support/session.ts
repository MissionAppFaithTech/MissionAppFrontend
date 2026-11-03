import type { BrowserContext, Page } from '@playwright/test';
import missionaryProfile from './missionary-profile.json';

/**
 * Same shape as `GET /api/account/profile` for a missionary owner. The fake
 * backend (`mock-api.mjs`) serves it to the server-rendered owner pages.
 */
export const missionaryProfileFixture = missionaryProfile;

function base64url(value: object) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

/** Unsigned JWT: the proxy and the server session only read it, the backend is mocked. */
export function fakeAccessToken(role: 'MISSIONARY' | 'SUPPORTER' = 'MISSIONARY', sub = 'e2e-user') {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${base64url({ alg: 'HS256' })}.${base64url({ sub, role, exp })}.e2e`;
}

/**
 * Logs a fake missionary in without a backend: sets the session cookie the proxy
 * and the server read (ADR-0005). The profile comes from `mock-api.mjs`; only the
 * client-side BFF calls are answered here.
 */
export async function mockMissionarySession(
  page: Page,
  context: BrowserContext = page.context(),
  /** A user of its own keeps a spec's saves away from the other specs. */
  sub = 'e2e-user'
) {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  await context.addCookies([
    {
      name: 'ma_access_token',
      value: fakeAccessToken('MISSIONARY', sub),
      url: baseURL,
      httpOnly: true,
    },
  ]);
  await page.route('**/api/auth/sessions', (route) =>
    route.fulfill({
      json: {
        data: [
          {
            id: 's1',
            deviceType: 'web',
            deviceName: 'Chrome',
            ipAddress: null,
            lastUsedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            current: true,
          },
        ],
      },
    })
  );
}
