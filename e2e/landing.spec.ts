import { test, expect } from '@playwright/test';

test.describe('Landing Page E2E', () => {
  test('leads with recurring campaigns and still lets the visitor explore and sign up', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Mission App/i);
    await expect(page.locator('h1')).toContainText(/campanhas\s*missionárias/i);
    await expect(
      page.locator('#inicio').getByRole('link', { name: 'Explorar missionários', exact: true })
    ).toHaveAttribute('href', '/navegacao');

    const startCta = page.getByRole('link', { name: /comece agora/i }).first();
    await startCta.scrollIntoViewIfNeeded();
    await expect(startCta).toBeVisible();
    await Promise.all([page.waitForURL('**/select-role'), startCta.click()]);
    await expect(page).toHaveURL(/.*select-role/);
  });

  test('takes a church from the campaign in effect to its media kit and QR code', async ({
    page,
  }) => {
    await page.goto('/');

    const campaign = page.locator('#campanha');
    await campaign.scrollIntoViewIfNeeded();
    await expect(campaign.getByRole('link', { name: 'Ver a campanha' })).toHaveAttribute(
      'href',
      /^\/campanha\//
    );
    await Promise.all([
      page.waitForURL('**/leve-o-mission-app-para-sua-igreja'),
      campaign.getByRole('link', { name: 'Leve o Mission App para sua igreja' }).click(),
    ]);

    const adoption = page.getByRole('region', {
      name: 'Como a igreja adota as campanhas recorrentes do Mission App',
    });
    await expect(adoption).toBeVisible();
    await expect(adoption.getByText('Em breve', { exact: true })).toHaveCount(3);
    await expect(
      adoption.getByRole('img', { name: /QR Code que abre a página da campanha/ })
    ).toBeVisible();

    const download = page.waitForEvent('download');
    await adoption.getByRole('button', { name: 'Baixar QR Code (PNG)' }).click();
    expect((await download).suggestedFilename()).toMatch(/^qr-code-.+\.png$/);

    await expect(page.getByRole('region', { name: 'O que é o Mission App' })).toBeAttached();

    // Then the mobilizers call leads to the council guide, which keeps the rest.
    const callout = page.getByRole('region', {
      name: 'Forme um grupo de mobilizadores na sua igreja',
    });
    await callout.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL('**/conselho-missionario'),
      callout.getByRole('link', { name: 'Aprenda como fundar um conselho missionário' }).click(),
    ]);
    await expect(page.getByRole('tab', { name: /passo a passo/i })).toBeVisible();
  });
});
