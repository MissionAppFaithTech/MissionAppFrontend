import { expect, test, type TestInfo } from '@playwright/test';
import { mockMissionarySession } from './support/session';

// ADR-0006: mutations run as Server Actions against the fake backend
// (e2e/support/mock-api.mjs), and the saved data comes back in the same response.
/** A user of its own per project and repetition, so saves never meet. */
const userFor = (prefix: string, info: TestInfo) =>
  `e2e-${prefix}-${info.project.name}-${info.repeatEachIndex}-${info.retry}`.replace(/\s+/g, '-');

test.describe('Mutations through Server Actions', () => {
  test('saving the "Sobre" shows the new value right away', async ({ page }, testInfo) => {
    await mockMissionarySession(page, page.context(), userFor('editor', testInfo));
    await page.goto('/profile/sobre/edit');
    // Type only after hydration, or React puts the initial value back.
    await page.waitForLoadState('networkidle');

    const verse = page.getByLabel(/versículo para a vida/i).filter({ visible: true });
    await verse.fill('Josué 1:9');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page).toHaveURL(/\/profile\/sobre$/);
    await expect(page.getByText('Josué 1:9').filter({ visible: true })).toBeVisible();
  });

  test('saving the header updates the name on the profile card', async ({ page }, testInfo) => {
    await mockMissionarySession(page, page.context(), userFor('header', testInfo));
    await page.goto('/profile/edit-profile');
    await page.waitForLoadState('networkidle');

    const name = page.getByLabel(/nome completo/i).filter({ visible: true });
    await name.fill('Samuel Mendonça Jr.');
    await page.getByRole('button', { name: 'Salvar' }).click();

    // Saving keeps the user on the edit page with a green confirmation.
    await expect(
      page.getByRole('status').filter({ hasText: 'Perfil atualizado com sucesso.' })
    ).toBeVisible();
    await expect(page).toHaveURL(/\/profile\/edit-profile$/);

    // Nothing pending: "Voltar" goes straight to the profile, already updated.
    await page.getByRole('link', { name: 'Voltar para o perfil' }).first().click();
    await expect(page).toHaveURL(/\/profile\/sobre$/);
    await expect(
      page.getByText('Samuel Mendonça Jr.', { exact: true }).filter({ visible: true }).first()
    ).toBeVisible();
  });

  test('logging in sets the session and opens the profile', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('textbox', { name: 'E-mail' }).fill('samuel@privado.test');
    await page.getByRole('textbox', { name: 'Senha' }).fill('Senha@123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/profile\/sobre$/);
    await expect(page.getByRole('button', { name: 'Abrir menu do perfil' })).toBeVisible();
  });

  test('wrong credentials keep the user on login with a message', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('textbox', { name: 'E-mail' }).fill('samuel@privado.test');
    await page.getByRole('textbox', { name: 'Senha' }).fill('Errada@123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByRole('alert').filter({ hasText: /senha/i })).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('logging out from the account menu goes to login', async ({ page }) => {
    await mockMissionarySession(page);
    await page.goto('/profile/sobre');

    await page.getByRole('button', { name: 'Abrir menu do perfil' }).click();
    await page.getByRole('button', { name: 'Sair da conta' }).click();

    await expect(page).toHaveURL(/\/login$/);
    const cookies = await page.context().cookies();
    expect(cookies.find((cookie) => cookie.name === 'ma_access_token')).toBeUndefined();
  });
});
