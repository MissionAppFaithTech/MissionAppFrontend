import { expect, test } from '@playwright/test';
import {
  fakeAccessToken,
  missionaryProfileFixture,
  mockMissionarySession,
} from './support/session';

// ADR-0005: the owner's profile is read on the server (from e2e/support/mock-api.mjs),
// so the page arrives with the data and the browser never asks the BFF for it.
test.describe('Owner profile read on the server', () => {
  test('renders the profile without a client-side profile request', async ({ page }) => {
    await mockMissionarySession(page);
    const clientReads: string[] = [];
    page.on('request', (request) => {
      if (
        request.method() === 'GET' &&
        new URL(request.url()).pathname === '/api/account/profile'
      ) {
        clientReads.push(request.url());
      }
    });

    await page.goto('/profile/sobre');

    await expect(
      page.getByText(missionaryProfileFixture.user.fullName, { exact: true }).first()
    ).toBeVisible();
    await expect(page.getByText(missionaryProfileFixture.missionary.lifeVerse)).toBeVisible();
    expect(clientReads).toEqual([]);
  });

  test('a session the backend already ended goes to login with the expired notice', async ({
    page,
    context,
    baseURL,
  }) => {
    // `e2e-revoked` is answered with 401 by the fake backend.
    await context.addCookies([
      {
        name: 'ma_access_token',
        value: fakeAccessToken('MISSIONARY', 'e2e-revoked'),
        url: baseURL ?? 'http://localhost:3000',
        httpOnly: true,
      },
    ]);

    await page.goto('/profile/sobre');

    await expect(page).toHaveURL(/\/login\?reason=expired/);
  });

  test('a visitor is sent to login, keeping where they were going', async ({ page }) => {
    await page.goto('/profile/sobre');

    await expect(page).toHaveURL(/\/login\?next=%2Fprofile%2Fsobre/);
    await expect(page.getByRole('heading', { name: 'Acesse sua conta' })).toBeVisible();
  });
});
