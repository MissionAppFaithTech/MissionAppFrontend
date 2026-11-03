import { test, expect } from '@playwright/test';

test.describe('Visitor Profile E2E', () => {
  test('loads public missionary profile, verifies tabs and locked content notice', async ({
    page,
  }) => {
    await page.goto('/user/_SamiMendonca');

    // Profile heading / name
    // NOTE: with Cache Components the <title> streams into <body>, so match the
    // visible handle exactly instead of any node containing the username.
    await expect(
      page.getByText('@_SamiMendonca', { exact: true }).filter({ visible: true })
    ).toBeVisible();

    // Guest CTA Banner
    await expect(
      page.getByText(/crie sua conta para acompanhar/i).filter({ visible: true })
    ).toBeVisible();

    // Tabs switching
    const sobreTab = page.getByRole('tab', { name: /sobre/i });
    await sobreTab.click();
    await expect(
      page.getByText(/resumo da história em missões/i).filter({ visible: true })
    ).toBeVisible();

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

    const campanhaTab = page.getByRole('tab', { name: /campanha/i });
    await campanhaTab.click();
    await expect(page.getByRole('button', { name: /ofertar na campanha/i })).toBeVisible();
  });
});
