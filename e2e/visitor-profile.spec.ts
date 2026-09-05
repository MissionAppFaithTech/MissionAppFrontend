import { test, expect } from '@playwright/test';

test.describe('Visitor Profile E2E', () => {
  test('loads public missionary profile, verifies tabs and locked content notice', async ({
    page,
  }) => {
    await page.goto('/user/_SamiMendonca');

    // Profile heading / name
    await expect(page.locator('text=_SamiMendonca')).toBeVisible();

    // Guest CTA Banner
    await expect(page.getByText(/crie sua conta para acompanhar/i)).toBeVisible();

    // Tabs switching
    const sobreTab = page.getByRole('tab', { name: /sobre/i });
    await sobreTab.click();
    await expect(page.getByText(/resumo da história em missões/i)).toBeVisible();

    const postagensTab = page.getByRole('tab', { name: /postagens/i });
    await postagensTab.click();
    await expect(page.getByText(/veja todas as postagens e orações/i)).toBeVisible();

    const projetosTab = page.getByRole('tab', { name: /projetos/i });
    await projetosTab.click();
    await expect(page.getByText(/projeto social na favela do lixão/i)).toBeVisible();

    const campanhaTab = page.getByRole('tab', { name: /campanha/i });
    await campanhaTab.click();
    await expect(page.getByRole('button', { name: /ofertar na campanha/i })).toBeVisible();
  });
});
