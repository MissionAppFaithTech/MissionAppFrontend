import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Registration: each field is checked when the user leaves it, errors are listed
 * in a focused summary on "Continuar", and a field the API rejects at the end
 * (e-mail in use) brings the user back to the step where it is typed.
 */

const visible = <T extends { filter: (o: { visible: boolean }) => T }>(locator: T) =>
  locator.filter({ visible: true });

/** The step's error summary (Next.js also renders an empty route-announcer alert). */
const summaryOf = (page: Page) => page.locator('form').getByRole('alert');

const field = (page: Page, name: RegExp) => visible(page.getByRole('textbox', { name }));

async function fillPersonalData(page: Page, email: string) {
  await field(page, /nome completo/i).fill('Maria Apoiadora');
  await field(page, /e-mail/i).fill(email);
  await field(page, /data de nascimento/i).fill('10051995');
  await visible(page.getByRole('radio', { name: 'Feminino' })).check();
  await field(page, /telefone/i).fill('21987654321');
}

async function fillCredentials(page: Page) {
  await field(page, /nome de usuário/i).fill(`maria_${Date.now() % 100000}`);
  await visible(page.getByLabel(/^senha/i)).fill('SenhaForte@123');
  await visible(page.getByLabel(/confirmar senha/i)).fill('SenhaForte@123');
}

test.describe('Cadastro — validação por etapa e acessibilidade', () => {
  test('a field is checked as soon as the user leaves it', async ({ page }) => {
    await page.goto('/register/supporters');

    await field(page, /nome completo/i).click();
    await page.keyboard.press('Tab');

    await expect(visible(page.getByText('Informe seu nome completo'))).toBeVisible();
    await expect(field(page, /nome completo/i)).toHaveAttribute('aria-invalid', 'true');
    // Nothing else complains yet, and there is no summary before "Continuar".
    await expect(visible(page.getByText('Informe seu e-mail'))).toHaveCount(0);
    await expect(visible(summaryOf(page))).toHaveCount(0);
  });

  test('"Continuar" with errors focuses a summary that leads to each field', async ({ page }) => {
    await page.goto('/register/supporters');

    await visible(page.getByRole('button', { name: 'Continuar' })).click();

    const summary = visible(summaryOf(page));
    await expect(summary).toBeFocused();
    await expect(summary).toContainText('Corrija 5 campos para continuar');

    await summary.getByRole('button', { name: /^E-mail:/ }).click();
    await expect(field(page, /e-mail/i)).toBeFocused();

    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual(
      []
    );
  });

  test('an e-mail the API rejects brings the user back to the personal data step', async ({
    page,
  }) => {
    await page.goto('/register/supporters');
    await fillPersonalData(page, 'usado@missionapp.test');
    await visible(page.getByRole('button', { name: 'Continuar' })).click();

    await expect(visible(page.getByRole('heading', { level: 2 }))).toContainText('Dados de acesso');
    await expect(visible(page.getByRole('heading', { level: 2 }))).toBeFocused();

    await fillCredentials(page);
    await visible(page.getByRole('button', { name: 'Finalizar cadastro' })).click();

    await expect(visible(page.getByRole('heading', { level: 2 }))).toContainText('Dados pessoais');
    const summary = visible(summaryOf(page));
    await expect(summary).toBeFocused();
    await expect(summary).toContainText(/E-mail: .*em uso/);
    await expect(field(page, /e-mail/i)).toHaveAttribute('aria-invalid', 'true');
    await expect(field(page, /e-mail/i)).toHaveValue('usado@missionapp.test');

    // Fixing the e-mail clears its error.
    await field(page, /e-mail/i).fill('livre@missionapp.test');
    await page.keyboard.press('Tab');
    await expect(field(page, /e-mail/i)).toHaveAttribute('aria-invalid', 'false');
  });

  test('fits a 360 px phone with readable steps and full-width actions', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/register/missionaries');

    const progress = visible(page.getByRole('navigation', { name: 'Progresso do cadastro' }));
    await expect(progress.getByRole('listitem')).toHaveCount(3);
    await expect(progress).toContainText('Etapa 1 de 3');

    const button = visible(page.getByRole('button', { name: 'Continuar' }));
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
