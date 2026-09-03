import { test, expect } from '@playwright/test';

test.describe('Landing Page E2E', () => {
  test('displays hero content and navigates to role selection', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/Mission App/i);

    // Hero title
    await expect(page.locator('h1')).toContainText(/conectando/i);

    // Start Now CTA
    const startCta = page.getByRole('link', { name: /comece agora/i }).first();
    await expect(startCta).toBeVisible();

    await Promise.all([page.waitForURL('**/select-role'), startCta.click()]);

    await expect(page).toHaveURL(/.*select-role/);
  });
});
