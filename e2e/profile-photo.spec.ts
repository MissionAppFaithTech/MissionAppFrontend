import { expect, test } from '@playwright/test';
import { mockMissionarySession } from './support/session';

// 1×1 transparent PNG: small enough for the 5 MB limit and a real image for <img>.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);
const STORED_PHOTO = /^http:\/\/localhost:\d+\/storage\/[\w-]+$/;

// Backend ADR-0040: presigned PUT → completion (202) → PATCH /account/profile,
// then the worker compresses the image. The fake API (e2e/support/mock-api.mjs)
// answers PROCESSING once before READY, so the page has to wait for the worker.
test.describe('Owner profile photo', () => {
  test('uploads, keeps after reload and removes the profile photo', async ({ page }, testInfo) => {
    await mockMissionarySession(page, page.context(), `e2e-photo-${testInfo.project.name}`);
    await page.goto('/profile/sobre');
    // Pick the file only after hydration, or the input has no change handler yet.
    await page.waitForLoadState('networkidle');

    // The header is rendered once per breakpoint: only act on the visible one.
    const visible = { visible: true } as const;
    const photo = page.getByRole('img', { name: /^Foto de perfil de / }).filter(visible);
    const addPhoto = page.getByLabel('Adicionar foto de perfil').filter(visible);
    await expect(addPhoto).toBeVisible();
    await expect(photo).toHaveCount(0);

    await addPhoto
      .locator('input[type="file"]')
      .setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG });

    await expect(
      page.getByRole('status').filter({ hasText: 'Foto de perfil atualizada.' })
      // Waits for the "worker": PROCESSING first, then READY.
    ).toHaveCount(1, { timeout: 15000 });
    await expect(photo).toHaveAttribute('src', STORED_PHOTO);
    await expect(page.getByLabel('Alterar foto de perfil').filter(visible)).toBeVisible();

    // Saved on the backend: the server render brings it back.
    await page.reload();
    await expect(photo).toHaveAttribute('src', STORED_PHOTO);

    await page.getByRole('button', { name: 'Remover foto de perfil' }).filter(visible).click();
    const dialog = page.getByRole('dialog', { name: 'Remover foto de perfil?' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /^remover/i }).click();

    await expect(photo).toHaveCount(0);
    await page.reload();
    await expect(addPhoto).toBeVisible();
    await expect(photo).toHaveCount(0);
  });
});
