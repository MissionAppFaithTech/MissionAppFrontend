import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.describe('Visitor Profile E2E', () => {
  test('loads public missionary profile, verifies tabs and locked content notice', async ({
    page,
  }) => {
    // The fake backend (e2e/support/mock-api.mjs) knows one approved missionary.
    await page.goto('/user/Samuel_Missionary');

    await expect(
      page.getByRole('heading', { level: 1, name: /samuel mendonça/i }).filter({ visible: true })
    ).toBeVisible();
    // NOTE: with Cache Components the <title> streams into <body>, so match the
    // visible handle exactly instead of any node containing the username.
    await expect(
      page.getByText('@samuel_missionary', { exact: true }).filter({ visible: true })
    ).toBeVisible();

    // Guest CTA Banner
    await expect(
      page.getByText(/crie sua conta para acompanhar/i).filter({ visible: true })
    ).toBeVisible();

    // Tabs switching
    const sobreTab = page.getByRole('tab', { name: /sobre/i });
    await sobreTab.click();
    await expect(
      page.getByText('Comecei em 2015 no sertão nordestino.').filter({ visible: true })
    ).toBeVisible();
    await expect(page.getByText('Dados de exemplo')).toHaveCount(0);

    const postagensTab = page.getByRole('tab', { name: /postagens/i });
    await postagensTab.click();
    await expect(
      page.getByText(/veja todas as postagens e orações/i).filter({ visible: true })
    ).toBeVisible();

    const projetosTab = page.getByRole('tab', { name: /projetos/i });
    await projetosTab.click();
    await expect(
      page.getByText(/projeto social na favela do lixão/i).filter({ visible: true })
    ).toBeVisible();
    // Tabs without an API yet say their content is an example.
    await expect(page.getByText('Dados de exemplo').filter({ visible: true })).toBeVisible();

    const campanhaTab = page.getByRole('tab', { name: /campanha/i });
    await campanhaTab.click();
    await expect(page.getByRole('button', { name: /ofertar na campanha/i })).toBeVisible();
  });

  test('a username without a visible profile gets the 404 page', async ({ page }) => {
    await page.goto('/user/_SamiMendonca');

    await expect(
      page
        .getByRole('heading', { level: 1, name: 'Página não encontrada' })
        .filter({ visible: true })
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('the supporter view shows the same real profile, accessibly', async ({ page }) => {
    await page.goto('/profile/missionario/samuel_missionary');

    await expect(
      page.getByRole('heading', { level: 1, name: /samuel mendonça/i }).filter({ visible: true })
    ).toBeVisible();
    await expect(
      page
        .getByRole('button', { name: /ofertar/i })
        .filter({ visible: true })
        .first()
    ).toBeVisible();

    await page.waitForFunction(
      () => !document.querySelector('template[id^="B:"], div[hidden][id^="S:"]')
    );
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
