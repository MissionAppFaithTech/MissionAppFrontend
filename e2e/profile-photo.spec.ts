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
  test('saved in "Editar perfil", shown in the header, navbar and menu', async ({
    page,
  }, testInfo) => {
    await mockMissionarySession(
      page,
      page.context(),
      `e2e-photo-${testInfo.project.name}-${testInfo.repeatEachIndex}-${testInfo.retry}`
    );
    await page.goto('/profile/sobre');
    await page.waitForLoadState('networkidle');

    // The header is rendered once per breakpoint: only check the visible one.
    const visible = { visible: true } as const;
    const headerPhoto = page.getByRole('img', { name: /^Foto de perfil de / }).filter(visible);
    const menuButton = page.getByRole('button', { name: 'Abrir menu do perfil' }).filter(visible);
    await expect(headerPhoto).toHaveCount(0);
    // The header only shows the photo: no add or remove controls.
    await expect(page.getByLabel(/(adicionar|alterar) foto de perfil/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Remover foto de perfil' })).toHaveCount(0);

    await page.goto('/profile/edit-profile');
    await page.waitForLoadState('networkidle');
    await page
      .getByLabel('Adicionar foto de perfil')
      .locator('input[type="file"]')
      .setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG });
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Foto de perfil adicionada com sucesso.' })
      // Waits for the "worker": PROCESSING first, then READY.
    ).toBeVisible({ timeout: 15000 });

    // Saved on the backend: the server render brings it to the header and navbar.
    await page.goto('/profile/sobre');
    await expect(headerPhoto).toHaveAttribute('src', STORED_PHOTO);
    await expect(menuButton.locator('img')).toHaveAttribute('src', STORED_PHOTO);
    await menuButton.click();
    await expect(
      page.locator('#profile-account-menu').getByRole('img', { name: /^Foto de perfil de / })
    ).toHaveAttribute('src', STORED_PHOTO);
    await page.keyboard.press('Escape');

    // Removed in "Editar perfil" as well.
    await page.goto('/profile/edit-profile');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Remover foto' }).click();
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Foto de perfil removida com sucesso.' })
    ).toBeVisible();

    await page.goto('/profile/sobre');
    await expect(page.getByRole('heading', { level: 1 }).filter(visible)).toBeVisible();
    await expect(headerPhoto).toHaveCount(0);
    await expect(menuButton.locator('img')).toHaveCount(0);
  });
});
