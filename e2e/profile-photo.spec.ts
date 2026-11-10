import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mockMissionarySession } from './support/session';

// 1×1 transparent PNG: a real image for the browser to open and for <img>.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);
const STORED_PHOTO = /^http:\/\/localhost:\d+\/storage\/[\w-]+$/;
const visible = { visible: true } as const;

async function openEditProfile(page: Page, testInfo: TestInfo, user: string) {
  await mockMissionarySession(
    page,
    page.context(),
    `${user}-${testInfo.project.name}-${testInfo.repeatEachIndex}-${testInfo.retry}`
  );
  await page.goto('/profile/edit-profile');
  await page.waitForLoadState('networkidle');
}

const choosePhoto = (page: Page, label: string | RegExp = 'Adicionar foto de perfil') =>
  page
    .getByLabel(label)
    .locator('input[type="file"]')
    .setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG });

const toast = (page: Page, text: string) => page.getByRole('status').filter({ hasText: text });

async function expectNoSeriousViolations(page: Page) {
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual(
    []
  );
}

// Backend ADR-0040: presigned PUT → completion (202) → the worker compresses the
// image → PATCH /account/profile. The fake API (e2e/support/mock-api.mjs)
// answers PROCESSING once before READY, so the dialog has to wait for the worker.
test.describe('Owner profile photo', () => {
  test('confirmed in a dialog, saved right away and shown in the form, navbar, menu and header', async ({
    page,
  }, testInfo) => {
    await openEditProfile(page, testInfo, 'e2e-photo');

    const formPhoto = page.getByRole('img', { name: /^Foto de perfil de / }).filter(visible);
    const menuButton = page.getByRole('button', { name: 'Abrir menu do perfil' }).filter(visible);
    await expect(formPhoto).toHaveCount(0);
    await expect(menuButton.locator('img')).toHaveCount(0);

    // Choosing only asks: nothing is saved yet.
    await choosePhoto(page);
    const confirm = page.getByRole('dialog', { name: 'Usar esta foto?' });
    await expect(confirm.getByRole('img')).toHaveAttribute('src', /^blob:/);
    await expect(confirm.getByRole('button', { name: 'Usar esta foto' })).toBeFocused();

    await confirm.getByRole('button', { name: 'Usar esta foto' }).click();
    await expect(toast(page, 'Foto de perfil adicionada com sucesso.')).toBeVisible({
      // Waits for the "worker": PROCESSING first, then READY.
      timeout: 15000,
    });
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // Without "Salvar" and without leaving the page: the form and the navbar.
    await expect(formPhoto).toHaveAttribute('src', STORED_PHOTO);
    await expect(menuButton.locator('img')).toHaveAttribute('src', STORED_PHOTO);
    await expect(page).toHaveURL(/\/profile\/edit-profile$/);
    await menuButton.click();
    await expect(
      page.locator('#profile-account-menu').getByRole('img', { name: /^Foto de perfil de / })
    ).toHaveAttribute('src', STORED_PHOTO);
    await page.keyboard.press('Escape');

    // Saved on the backend: the profile header has it too.
    await page.goto('/profile/sobre');
    await expect(
      page.getByRole('img', { name: /^Foto de perfil de / }).filter(visible)
    ).toHaveAttribute('src', STORED_PHOTO);

    // Removing asks first and is saved right away as well.
    await page.goto('/profile/edit-profile');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Remover foto' }).click();
    const removal = page.getByRole('dialog', { name: 'Remover sua foto de perfil?' });
    await removal.getByRole('button', { name: 'Manter foto' }).click();
    await expect(removal).toBeHidden();
    await expect(formPhoto).toHaveAttribute('src', STORED_PHOTO);

    await page.getByRole('button', { name: 'Remover foto' }).click();
    await removal.getByRole('button', { name: 'Remover foto' }).click();
    await expect(toast(page, 'Foto de perfil removida com sucesso.')).toBeVisible();
    await expect(formPhoto).toHaveCount(0);
    await expect(menuButton.locator('img')).toHaveCount(0);

    await page.goto('/profile/sobre');
    await expect(page.getByRole('heading', { level: 1 }).filter(visible)).toBeVisible();
    await expect(
      page.getByRole('img', { name: /^Foto de perfil de / }).filter(visible)
    ).toHaveCount(0);
  });

  test('the confirmation fits a 360px phone, with stacked 44px buttons, and is accessible', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await openEditProfile(page, testInfo, 'e2e-photo-layout');

    await choosePhoto(page);
    const dialog = page.getByRole('dialog', { name: 'Usar esta foto?' });
    const use = dialog.getByRole('button', { name: 'Usar esta foto' });
    const other = dialog.getByText('Escolher outra');
    await expect(use).toBeVisible();

    const useBox = (await use.boundingBox())!;
    const otherBox = (await other.boundingBox())!;
    expect(useBox.height).toBeGreaterThanOrEqual(44);
    expect(otherBox.height).toBeGreaterThanOrEqual(44);
    // Stacked, the main action on top, both as wide as each other.
    expect(otherBox.y).toBeGreaterThan(useBox.y);
    expect(Math.abs(otherBox.width - useBox.width)).toBeLessThan(2);
    const closeBox = (await dialog.getByRole('button', { name: 'Fechar' }).boundingBox())!;
    expect(closeBox.width).toBeGreaterThanOrEqual(44);
    expect(closeBox.height).toBeGreaterThanOrEqual(44);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expectNoSeriousViolations(page);

    // Closing leaves the account without a photo.
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('img', { name: /^Foto de perfil de / })).toHaveCount(0);
  });

  test('a failed upload shows what happened and "Tentar novamente" sends the same photo', async ({
    page,
  }, testInfo) => {
    await openEditProfile(page, testInfo, 'e2e-photo-retry');
    let blocked = true;
    await page.route('**/storage/**', (route) =>
      blocked && route.request().method() === 'PUT' ? route.abort() : route.continue()
    );

    await choosePhoto(page);
    await page.getByRole('button', { name: 'Usar esta foto' }).click();

    const error = page.getByRole('dialog', { name: 'Sem conexão com a internet' });
    await expect(error.getByRole('alert')).toContainText(
      'Verifique seu Wi‑Fi ou seus dados móveis e tente de novo.'
    );
    await expect(error.getByRole('alert')).toContainText('Você continua sem foto de perfil.');
    const retry = error.getByRole('button', { name: 'Tentar novamente' });
    await expect(retry).toBeFocused();
    await expectNoSeriousViolations(page);
    await expect(page.getByRole('img', { name: /^Foto de perfil de / })).toHaveCount(0);

    blocked = false;
    await retry.click();
    await expect(toast(page, 'Foto de perfil adicionada com sucesso.')).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole('img', { name: /^Foto de perfil de / }).filter(visible)
    ).toHaveAttribute('src', STORED_PHOTO);
  });

  test('a photo the backend cannot process asks for another one and changes nothing', async ({
    page,
  }, testInfo) => {
    await openEditProfile(page, testInfo, 'e2e-photo-fail');

    await choosePhoto(page);
    await page.getByRole('button', { name: 'Usar esta foto' }).click();

    const error = page.getByRole('dialog', { name: 'Não conseguimos usar esta imagem' });
    await expect(error.getByRole('alert')).toContainText('Escolha outra foto.', { timeout: 15000 });
    await expect(error.getByRole('button', { name: 'Tentar novamente' })).toHaveCount(0);
    await expect(error.getByText('Escolher outra foto')).toBeFocused();

    await error.getByRole('button', { name: 'Fechar' }).last().click();
    await expect(error).toBeHidden();
    await expect(page.getByRole('img', { name: /^Foto de perfil de / })).toHaveCount(0);

    // Nothing was linked to the account.
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByLabel('Adicionar foto de perfil').filter(visible)).toBeVisible();
    await expect(page.getByRole('img', { name: /^Foto de perfil de / })).toHaveCount(0);
  });
});
