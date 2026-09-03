import { test, expect } from '@playwright/test';

test.describe('Auth Flow E2E', () => {
  test('navigates to login and checks input fields and forgot password navigation', async ({
    page,
  }) => {
    await page.goto('/login');

    // Email and Password inputs
    const emailInput = page.getByPlaceholder(/seu@email.com/i);
    const passwordInput = page.getByPlaceholder(/sua senha/i);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await emailInput.fill('user@domain.com');
    await passwordInput.fill('Secret123!');

    // Check link to forgot password
    const forgotLink = page.getByRole('link', { name: /esqueceu sua senha/i });
    await expect(forgotLink).toBeVisible();

    await Promise.all([page.waitForURL('**/forgot-password'), forgotLink.click()]);

    await expect(page).toHaveURL(/.*forgot-password/);
  });
});
