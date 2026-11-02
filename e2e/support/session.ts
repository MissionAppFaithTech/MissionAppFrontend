import type { BrowserContext, Page } from '@playwright/test';

/** Same shape as `GET /api/account/profile` (BFF) for a missionary owner. */
export const missionaryProfileFixture = {
  user: {
    id: 'e2e-user',
    fullName: 'Samuel Mendonça',
    username: 'samuel_missionary',
    email: 'samuel@privado.test',
    phoneNumber: '+5521987654321',
    biography: 'Missionário na África do Sul',
    profilePictureId: null,
    role: 'MISSIONARY',
  },
  missionary: {
    id: 'e2e-missionary',
    aboutMe: 'Sirvo comunidades rurais há dez anos.',
    missionStorySummary: 'Comecei em 2015 no sertão nordestino.',
    originLocation: 'Recife - Brasil',
    prayerRequest: 'Pela saúde da equipe.',
    lifeVerse: 'Filipenses 4:13',
    publicEmail: 'contato@missao.test',
    publicPhone: '+5521912345678',
    missionaryAgencyId: 'agency-1',
    faithCommunityId: 'community-1',
  },
  workAddress: {
    zip: '48900-000',
    district: 'Centro',
    city: 'Juazeiro',
    state: 'BA',
    country: 'Brasil',
  },
  missionaryAgency: { id: 'agency-1', name: 'JOCUM' },
  faithCommunity: { id: 'community-1', name: 'Igreja Batista Central' },
};

function base64url(value: object) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

/** Unsigned JWT: the proxy and `/api/auth/session` only read it, the backend is mocked. */
export function fakeAccessToken(role: 'MISSIONARY' | 'SUPPORTER' = 'MISSIONARY') {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${base64url({ alg: 'HS256' })}.${base64url({ sub: 'e2e-user', role, exp })}.e2e`;
}

/**
 * Logs a fake missionary in without a backend: sets the session cookie the proxy
 * checks and answers the BFF routes the owner pages call.
 */
export async function mockMissionarySession(page: Page, context: BrowserContext = page.context()) {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  await context.addCookies([
    { name: 'ma_access_token', value: fakeAccessToken(), url: baseURL, httpOnly: true },
  ]);
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({
      json: { data: { authenticated: true, userId: 'e2e-user', role: 'MISSIONARY' } },
    })
  );
  await page.route('**/api/account/profile', (route) =>
    route.fulfill({ json: { data: missionaryProfileFixture } })
  );
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
