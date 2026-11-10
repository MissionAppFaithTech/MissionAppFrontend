import { expect, test, type Page } from '@playwright/test';
import { backendEnvFile } from './support/stack.mjs';

/**
 * Profile photo against the real backend, storage and queue worker (backend
 * ADR-0040): the browser gets a real presigned URL, PUTs the file to the
 * storage and confirms it, the worker compresses the image and only then the
 * photo is linked to the account, all from the "Usar esta foto?" dialog.
 *
 * Each project uses its own seeded missionary, so they can run in parallel.
 */

// 1×1 PNG: a real image for the browser to open.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);
const SEED_PASSWORD = backendEnvFile().SEED_USER_PASSWORD ?? 'password123';
const SEED_USERS: Record<string, string> = {
  chromium: 'missionary1@missionapp.test',
  'Mobile Chrome': 'missionary2@missionapp.test',
};

const visible = { visible: true } as const;

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.getByRole('textbox', { name: 'E-mail' }).fill(email);
  await page.getByRole('textbox', { name: 'Senha' }).fill(SEED_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/profile\//);
  await page.waitForLoadState('networkidle');
}

test.describe('Foto de perfil (backend real)', () => {
  test('sends a confirmed photo to the real storage, links it and removes it', async ({
    page,
  }, testInfo) => {
    await login(page, SEED_USERS[testInfo.project.name]);
    await page.goto('/profile/edit-profile');
    await page.waitForLoadState('networkidle');

    const formPhoto = page.getByRole('img', { name: /^Foto de perfil de / }).filter(visible);
    const menuPhoto = page
      .getByRole('button', { name: 'Abrir menu do perfil' })
      .filter(visible)
      .locator('img');
    await page
      .getByLabel('Adicionar foto de perfil')
      .filter(visible)
      .locator('input[type="file"]')
      .setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG });

    const confirm = page.getByRole('dialog', { name: 'Usar esta foto?' });
    await confirm.getByRole('button', { name: 'Usar esta foto' }).click();

    await expect(
      page.getByRole('status').filter({ hasText: 'Foto de perfil adicionada com sucesso.' })
    ).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // Without "Salvar" and without leaving the page: the compressed image from
    // the storage is in the form and in the navbar, and it really loads.
    await expect(page).toHaveURL(/\/profile\/edit-profile$/);
    await expect(formPhoto).toHaveAttribute('src', /^https?:.*\.webp$/);
    await expect(menuPhoto).toHaveAttribute('src', /^https?:.*\.webp$/);
    await expect
      .poll(() => formPhoto.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth))
      .toBeGreaterThan(0);

    // Removing is saved right away on the real account as well.
    await page.getByRole('button', { name: 'Remover foto' }).click();
    await page
      .getByRole('dialog', { name: 'Remover sua foto de perfil?' })
      .getByRole('button', { name: 'Remover foto' })
      .click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Foto de perfil removida com sucesso.' })
    ).toBeVisible();
    await expect(formPhoto).toHaveCount(0);
    await expect(menuPhoto).toHaveCount(0);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByLabel('Adicionar foto de perfil').filter(visible)).toBeVisible();
  });
});
