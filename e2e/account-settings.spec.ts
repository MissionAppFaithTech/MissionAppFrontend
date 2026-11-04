import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { mockMissionarySession } from './support/session';

/** Account settings: "Voltar" to the profile and "Cancelar" per form. */
test.describe('Configurações de Conta — Voltar e Cancelar', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await mockMissionarySession(page, page.context(), `e2e-settings-${testInfo.project.name}`);
  });

  test('"Voltar" opens the profile', async ({ page }) => {
    await page.goto('/profile/configuracoes');

    const back = page.getByRole('link', { name: 'Voltar para o perfil' }).filter({ visible: true });
    await expect(back).toHaveCount(2);
    await back.first().click();

    await expect(page).toHaveURL(/\/profile\/sobre$/);
  });

  test('"Cancelar" restores the ecclesiastical data without leaving the page', async ({ page }) => {
    await page.goto('/profile/configuracoes');

    const community = page
      .getByRole('combobox', { name: /Comunidade de Fé \(Igreja\)/ })
      .filter({ visible: true });
    const saved = await community.textContent();
    const cancel = page
      .getByRole('button', { name: 'Cancelar alterações dos dados eclesiásticos' })
      .filter({ visible: true });
    await expect(cancel).toBeDisabled();

    await community.click();
    await page.getByRole('option', { name: 'Nenhuma comunidade de fé' }).click();
    await expect(community).not.toHaveText(saved ?? '');
    await expect(cancel).toBeEnabled();
    await cancel.click();

    await expect(community).toHaveText(saved ?? '');
    await expect(cancel).toBeDisabled();
    await expect(page).toHaveURL(/\/profile\/configuracoes$/);
  });

  test('fits a 360 px phone: stacked full-width actions, no horizontal scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/profile/configuracoes');

    const save = page
      .getByRole('button', { name: 'Salvar Dados Eclesiásticos' })
      .filter({ visible: true });
    const cancel = page
      .getByRole('button', { name: 'Cancelar alterações dos dados eclesiásticos' })
      .filter({ visible: true });
    await expect(save).toBeVisible();

    const saveBox = (await save.boundingBox())!;
    const cancelBox = (await cancel.boundingBox())!;
    // Primary action on top, "Cancelar" below it, both as wide as each other.
    expect(cancelBox.y).toBeGreaterThan(saveBox.y);
    expect(Math.abs(cancelBox.width - saveBox.width)).toBeLessThan(2);
    expect(cancelBox.height).toBeGreaterThanOrEqual(44);

    const back = page.getByRole('link', { name: 'Voltar para o perfil' }).filter({ visible: true });
    expect((await back.first().boundingBox())!.height).toBeGreaterThanOrEqual(44);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);

    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual(
      []
    );
  });
});
