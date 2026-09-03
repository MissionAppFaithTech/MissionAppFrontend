import { test, expect } from '@playwright/test';

test.describe('Visitor Profile E2E', () => {
  test('loads public missionary profile, verifies tabs and locked content notice', async ({
    page,
  }) => {
    await page.goto('/user/_SamiMendonca');

    // Profile heading / name
    await expect(page.locator('text=_SamiMendonca')).toBeVisible();

    // Guest CTA Banner
    await expect(
      page.getByText(/crie sua conta para acompanhar/i)
    ).toBeVisible();

    // Tabs switching
    const postagensTab = page.getByRole('tab', { name: /postagens/i });
    await postagensTab.click();
    await expect(
      page.getByText(/veja todas as postagens e orações/i)
    ).toBeVisible();

    const sobreTab = page.getByRole('tab', { name: /sobre/i });
    await sobreTab.click();
    await expect(
      page.getByText(/resumo da história em missões/i)
    ).toBeVisible();

    // Member Locked Content Notice
    await expect(
      page.getByText(/entre para ver o perfil completo/i)
    ).toBeVisible();
  });
});
