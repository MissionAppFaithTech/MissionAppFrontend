import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { fakeAccessToken } from './support/session';

async function signIn(page: Page, sub: string) {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  await page.context().addCookies([
    {
      name: 'ma_access_token',
      value: fakeAccessToken('SUPPORTER', sub),
      url: baseURL,
      httpOnly: true,
    },
  ]);
}

async function openReportModal(page: Page) {
  await page.goto('/user/Samuel_Missionary');
  await page
    .getByRole('button', { name: 'Mais opções do perfil' })
    .filter({ visible: true })
    .click();
  await page.getByRole('menuitem', { name: 'Denunciar' }).click();
  await expect(page.getByRole('dialog', { name: 'Denunciar' })).toBeVisible();
}

for (const viewport of [
  { name: 'mobile 360px', width: 360, height: 740 },
  { name: 'desktop 1280px', width: 1280, height: 800 },
]) {
  test.describe(`Report modal (${viewport.name})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test('requires a reason, sends and shows the success toast', async ({ page }) => {
      await signIn(page, 'e2e-report-ok');
      await openReportModal(page);

      const submit = page.getByRole('button', { name: 'DENUNCIAR' });
      await expect(submit).toBeDisabled();
      await page.getByRole('radio', { name: 'Outro' }).check();
      await expect(page.getByLabel(/Escreva a razão da Denúncia/)).toBeVisible();
      await page.getByRole('radio', { name: 'Spam ou conteúdo indesejado' }).check();
      await expect(page.getByLabel(/Escreva a razão da Denúncia/)).toHaveCount(0);

      const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
      expect(
        results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
      ).toEqual([]);

      const box = await page.getByRole('dialog').boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);

      await submit.click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(
        page.getByRole('status').filter({ hasText: 'Denúncia enviada com sucesso' })
      ).toBeVisible();
    });

    test('closes the modal and shows the error toast on failure', async ({ page }) => {
      await signIn(page, 'e2e-report-fail');
      await openReportModal(page);
      await page.getByRole('radio', { name: 'Assédio ou bullying' }).check();
      await page.getByRole('button', { name: 'DENUNCIAR' }).click();

      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(
        page.getByRole('alert').filter({ hasText: 'Não foi possível enviar sua denúncia' })
      ).toBeVisible();
    });
  });
}
