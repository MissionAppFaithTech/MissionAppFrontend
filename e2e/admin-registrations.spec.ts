import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { fakeAccessToken } from './support/session';

test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([
    { name: 'ma_access_token', value: fakeAccessToken('ADMIN'), url: baseURL!, httpOnly: true },
  ]);
});

async function assertAccessible(page: import('@playwright/test').Page) {
  await page.addStyleTag({
    content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
  });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
    )
  ).toBe(true);
}

test('filters registrations, reviews details and records local decisions', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Missionários cadastrados' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Pendentes 12', selected: true })).toBeVisible();
  await page.getByRole('button', { name: 'Próxima página' }).click();
  await expect(page.getByText('Exibindo 9–12 de 12 missionários')).toBeVisible();
  await page.getByRole('textbox', { name: 'Buscar por nome ou e-mail' }).fill('Ana Carolina');
  await page.getByRole('link', { name: 'Ver cadastro de Ana Carolina Silva' }).click();
  await expect(page).toHaveURL(/\/admin\/missionarios\/1$/);
  await expect(page.getByRole('heading', { name: 'Dados ministeriais' })).toBeVisible();
  const reject = page.getByRole('button', { name: 'Reprovar cadastro', exact: true });
  await reject.click();
  let dialog = page.getByRole('dialog', { name: 'Reprovar cadastro' });
  await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(reject).toBeFocused();
  await reject.click();
  dialog = page.getByRole('dialog', { name: 'Reprovar cadastro' });
  await dialog.getByRole('button', { name: 'Reprovar cadastro', exact: true }).click();
  const reason = dialog.getByRole('textbox', { name: /Motivo da reprovação/ });
  await expect(reason).toHaveAttribute('aria-invalid', 'true');
  await expect(reason).toBeFocused();
  await reason.fill('Complete a descrição com as atividades previstas em Maputo.');
  await dialog.getByRole('button', { name: 'Reprovar cadastro', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Cadastro reprovado' })).toBeFocused();
  await expect(
    page.getByText('Motivo: Complete a descrição com as atividades previstas em Maputo.')
  ).toBeVisible();
  await page.getByRole('link', { name: 'Voltar para missionários' }).click();
  await expect(page.getByRole('tab', { name: 'Reprovados 9' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Pendentes 11' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Buscar por nome ou e-mail' }).fill('');
  await page.getByRole('link', { name: 'Ver cadastro de Lucas Oliveira' }).click();
  await page.getByRole('button', { name: 'Aprovar cadastro' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Cadastro aprovado' })).toBeFocused();
  await page.getByRole('link', { name: 'Voltar para missionários' }).click();
  await expect(page.getByRole('tab', { name: 'Aprovados 109' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Pendentes 12' })).toBeVisible();
});

for (const width of [360, 768, 1280, 1920]) {
  test(`accessible layouts and rejection dialog at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Missionários cadastrados' })).toBeVisible();
    await page.getByRole('tab', { name: 'Todos 128' }).click();
    await expect(page.getByRole('main')).toHaveCount(1);
    await assertAccessible(page);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: testInfo.outputPath(`admin-list-${width}.png`), fullPage: true });
    await page.getByRole('link', { name: 'Ver cadastro de Ana Carolina Silva' }).click();
    await expect(page.getByRole('heading', { name: 'Análise de cadastro' })).toBeVisible();
    await assertAccessible(page);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({
      path: testInfo.outputPath(`admin-detail-${width}.png`),
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Reprovar cadastro', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Reprovar cadastro' });
    await expect(dialog).toBeVisible();
    await assertAccessible(page);
    await page.screenshot({
      path: testInfo.outputPath(`admin-reject-${width}.png`),
      fullPage: false,
    });
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  });
}

test('handles unknown registrations and dark mode', async ({ page }) => {
  await page.goto('/admin/missionarios/missing');
  await expect(page.getByRole('heading', { name: 'Cadastro não encontrado' })).toBeVisible();
  await page.getByRole('link', { name: 'Voltar para a lista' }).click();
  await page.getByRole('button', { name: 'Abrir menu do perfil' }).click();
  await page.getByRole('button', { name: 'Escuro', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('group', { name: 'Aparência' })).not.toBeVisible();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await assertAccessible(page);
  await page.getByRole('link', { name: 'Ver cadastro de Ana Carolina Silva' }).click();
  await assertAccessible(page);
  await page.getByRole('button', { name: 'Reprovar cadastro', exact: true }).click();
  await assertAccessible(page);
});
