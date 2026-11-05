import { expect, test, type Page } from '@playwright/test';

// 1×1 PNG for the photo upload (fake API: e2e/support/mock-api.mjs).
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);
const visible = { visible: true } as const;

// Login and logout are soft navigations and Next.js keeps a route's client
// state: nothing from the previous account may survive into the next one.
test.describe('Switching accounts in the same tab', () => {
  test("the next account never sees the previous one's photo or unsaved text", async ({
    page,
  }, testInfo) => {
    const tag = testInfo.project.name.replace(/\W+/g, '-');
    const fillLogin = async (email: string) => {
      await page.waitForLoadState('networkidle');
      await page.getByRole('textbox', { name: 'E-mail' }).fill(email);
      await page.getByRole('textbox', { name: 'Senha' }).fill('Senha@123');
      await page.getByRole('button', { name: 'Entrar' }).click();
      await expect(page).toHaveURL(/\/profile\/sobre$/);
      await page.waitForLoadState('networkidle');
    };
    const photo = (p: Page) => p.getByRole('img', { name: /^Foto de perfil de / }).filter(visible);

    // Account A: new photo and an unsaved bio.
    await page.goto('/login');
    await fillLogin(`samuel+switch-a-${tag}@privado.test`);
    await page
      .getByRole('link', { name: /editar perfil/i })
      .filter(visible)
      .click();
    await page.waitForLoadState('networkidle');
    await page
      .getByLabel('Adicionar foto de perfil')
      .locator('input[type="file"]')
      .setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG });
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Foto de perfil adicionada com sucesso.' })
    ).toBeVisible({ timeout: 15000 });

    const bio = page.getByRole('textbox', { name: 'Minibiografia' });
    await bio.fill('Texto que a conta A não salvou');
    // Browser back: the edit page keeps its client state in Next.js.
    await page.goBack();
    await expect(page).toHaveURL(/\/profile\/sobre$/);
    await expect(photo(page)).toHaveAttribute('src', /\/storage\//);

    // Log out and in as account B, without reloading the tab.
    await page.getByRole('button', { name: 'Abrir menu do perfil' }).filter(visible).click();
    await page.getByRole('button', { name: 'Sair da conta' }).click();
    await expect(page).toHaveURL(/\/login/);
    await fillLogin(`samuel+switch-b-${tag}@privado.test`);

    await expect(page.getByRole('heading', { level: 1 }).filter(visible)).toBeVisible();
    await expect(photo(page)).toHaveCount(0);

    await page
      .getByRole('link', { name: /editar perfil/i })
      .filter(visible)
      .click();
    await expect(page.getByRole('textbox', { name: 'Minibiografia' })).not.toHaveValue(
      'Texto que a conta A não salvou'
    );
  });
});
