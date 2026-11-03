import { test, expect } from '@playwright/test';

test.describe('Auth Flow E2E', () => {
  test('navigates to login and checks input fields and forgot password navigation', async ({
    page,
  }) => {
    await page.goto('/login');

    // Email and Password inputs, by accessible name: while the page streams, a
    // hidden copy of the form may briefly sit in the DOM (out of the a11y tree).
    const emailInput = page.getByRole('textbox', { name: 'E-mail' });
    const passwordInput = page.getByRole('textbox', { name: 'Senha' });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await emailInput.fill('user@domain.com');
    await passwordInput.fill('Secret123!');
    // What the user typed survives the end of streaming.
    await page.waitForLoadState('networkidle');
    await expect(emailInput).toHaveValue('user@domain.com');

    // Check link to forgot password
    const forgotLink = page.getByRole('link', { name: /esqueceu sua senha/i });
    await expect(forgotLink).toBeVisible();

    await Promise.all([page.waitForURL('**/forgot-password'), forgotLink.click()]);

    await expect(page).toHaveURL(/.*forgot-password/);
  });
});
