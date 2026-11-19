import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { mockMissionarySession } from './support/session';

/** Account settings: "Voltar" to the profile and "Cancelar" per form. */
test.describe('Configurações de Conta — Voltar e Cancelar', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await mockMissionarySession(page, page.context(), `e2e-settings-${testInfo.project.name}`);
  });

  test('"Voltar" opens the profile', async ({ page }) => {
    await page.goto('/profile/configuracoes');

    const back = page.getByRole('link', { name: 'Voltar para o perfil' }).filter({ visible: true });
    await expect(back).toHaveCount(2);
    await back.first().click();

    await expect(page).toHaveURL(/\/profile\/sobre$/);
  });

  test('"Cancelar" restores the ecclesiastical data without leaving the page', async ({ page }) => {
    await page.goto('/profile/configuracoes');

    const community = page
      .getByRole('combobox', { name: /Comunidade de Fé \(Igreja\)/ })
      .filter({ visible: true });
    const saved = await community.inputValue();
    expect(saved).not.toBe('');
    const cancel = page
      .getByRole('button', { name: 'Cancelar alterações dos dados eclesiásticos' })
      .filter({ visible: true });
    await expect(cancel).toBeDisabled();

    // Clearing the field unlinks the community (not saved yet).
    await community.click();
    await page.getByRole('button', { name: 'Limpar' }).filter({ visible: true }).click();
    await expect(community).toHaveValue('');
    await expect(cancel).toBeEnabled();
    await cancel.click();

    await expect(community).toHaveValue(saved);
    await expect(cancel).toBeDisabled();
    await expect(page).toHaveURL(/\/profile\/configuracoes$/);
  });

  test('updates the login email with current password confirmation', async ({ page }) => {
    await page.goto('/profile/configuracoes');

    await page.getByLabel('Novo E-mail').fill('samuel.novo@privado.test');
    await page.getByLabel('Senha Atual (para confirmar)').fill('Senha@123');
    await page.getByRole('button', { name: 'Atualizar E-mail' }).click();

    await expect(page.getByText('samuel.novo@privado.test').first()).toBeVisible();
  });

  test('displays API validation errors when changing email with wrong password or taken email', async ({
    page,
  }) => {
    await page.goto('/profile/configuracoes');

    await page.getByLabel('Novo E-mail').fill('usado@missionapp.test');
    await page.getByLabel('Senha Atual (para confirmar)').fill('Senha@123');
    await page.getByRole('button', { name: 'Atualizar E-mail' }).click();

    await expect(page.getByText('Este e-mail já está em uso.')).toBeVisible();

    await page.getByLabel('Novo E-mail').fill('livre@missionapp.test');
    await page.getByLabel('Senha Atual (para confirmar)').fill('SenhaErrada');
    await page.getByRole('button', { name: 'Atualizar E-mail' }).click();

    await expect(page.getByText('A senha atual está incorreta.')).toBeVisible();
  });

  test('triggers password reset email link and displays confirmation feedback', async ({
    page,
  }) => {
    await page.goto('/profile/configuracoes');

    await page.getByRole('button', { name: 'Enviar Link de Redefinição para meu E-mail' }).click();

    await expect(page.getByText(/Link seguro de redefinição de senha enviado/i)).toBeVisible();
  });

  test('edits the linked faith community details in the modal', async ({ page }) => {
    await page.goto('/profile/configuracoes');

    await page.getByRole('button', { name: 'Editar dados da comunidade' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Editar comunidade de fé' })).toBeVisible();

    const pastorInput = dialog.getByRole('textbox', { name: /Nome do pastor/i });
    await pastorInput.fill('Pr. Lucas Silva');
    await dialog.getByRole('button', { name: /^Salvar$/i }).click();

    await expect(dialog).toBeHidden();
    await expect(
      page.getByText(/Dados da comunidade de fé atualizados com sucesso/i)
    ).toBeVisible();
  });

  test('changes the password directly and redirects to login', async ({ page }) => {
    await page.goto('/profile/configuracoes');

    await page.getByLabel('Senha Atual', { exact: true }).fill('Senha@123');
    await page.getByLabel('Nova Senha', { exact: true }).fill('NovaSenha@123');
    await page.getByLabel('Confirmar Nova Senha').fill('NovaSenha@123');
    await page.getByRole('button', { name: 'Alterar Senha' }).click();

    await expect(page).toHaveURL(/\/login(?:\?|$)/);
  });

  test('fits a 360 px phone: stacked full-width actions, no horizontal scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/profile/configuracoes');

    const save = page
      .getByRole('button', { name: 'Salvar Dados Eclesiásticos' })
      .filter({ visible: true });
    const cancel = page
      .getByRole('button', { name: 'Cancelar alterações dos dados eclesiásticos' })
      .filter({ visible: true });
    await expect(save).toBeVisible();

    const saveBox = (await save.boundingBox())!;
    const cancelBox = (await cancel.boundingBox())!;
    // Primary action on top, "Cancelar" below it, both as wide as each other.
    expect(cancelBox.y).toBeGreaterThan(saveBox.y);
    expect(Math.abs(cancelBox.width - saveBox.width)).toBeLessThan(2);
    expect(cancelBox.height).toBeGreaterThanOrEqual(44);

    const back = page.getByRole('link', { name: 'Voltar para o perfil' }).filter({ visible: true });
    expect((await back.first().boundingBox())!.height).toBeGreaterThanOrEqual(44);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);

    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(axe.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual(
      []
    );
  });
});
