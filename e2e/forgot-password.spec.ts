import { expect, test, type Page } from '@playwright/test';

/** "Esqueci minha senha": the result screen has a way back and never gets stuck. */

const EMAIL = 'missionary1@missionapp.test';

async function requestLink(page: Page) {
  await page.getByRole('textbox', { name: 'E-mail' }).filter({ visible: true }).fill(EMAIL);
  await page
    .getByRole('button', { name: /enviar link/i })
    .filter({ visible: true })
    .click();
  await expect(page.getByText(/enviamos um link/i).filter({ visible: true })).toBeVisible();
}

const sendButton = (page: Page) =>
  page.getByRole('button', { name: /enviar link/i }).filter({ visible: true });

test.describe('Esqueci minha senha', () => {
  test('"Voltar" on the result goes to login, and the link opens a fresh form', async ({
    page,
  }) => {
    await page.goto('/forgot-password');
    await requestLink(page);

    await page.getByRole('link', { name: 'Voltar' }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page
      .getByRole('link', { name: /esqueceu sua senha/i })
      .filter({ visible: true })
      .click();
    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(sendButton(page)).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'E-mail' }).filter({ visible: true })
    ).toHaveValue('');
  });

  test('browser back and forward bring the form back, not the old result', async ({ page }) => {
    await page.goto('/login');
    await page
      .getByRole('link', { name: /esqueceu sua senha/i })
      .filter({ visible: true })
      .click();
    await expect(page).toHaveURL(/\/forgot-password$/);
    await requestLink(page);

    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
    await page.goForward();

    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(sendButton(page)).toBeVisible();
  });

  test('"Enviar para outro e-mail" shows the form again', async ({ page }) => {
    await page.goto('/forgot-password');
    await requestLink(page);

    await page
      .getByRole('button', { name: 'Enviar para outro e-mail' })
      .filter({ visible: true })
      .click();

    await expect(sendButton(page)).toBeVisible();
  });

  test('result actions stack at full width on a 360 px phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/forgot-password');
    await requestLink(page);

    const back = page.getByRole('link', { name: 'Voltar' }).filter({ visible: true });
    const other = page
      .getByRole('button', { name: 'Enviar para outro e-mail' })
      .filter({ visible: true });
    const backBox = (await back.boundingBox())!;
    const otherBox = (await other.boundingBox())!;
    expect(otherBox.y).toBeGreaterThan(backBox.y);
    expect(Math.abs(otherBox.width - backBox.width)).toBeLessThan(2);
    expect(backBox.height).toBeGreaterThanOrEqual(44);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
