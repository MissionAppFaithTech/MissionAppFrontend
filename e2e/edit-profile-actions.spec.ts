import { expect, test } from '@playwright/test';
import { mockMissionarySession } from './support/session';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

// "Editar perfil": the photo is saved on its own, right away; "Voltar" only deals
// with the fields and asks before dropping unsaved changes.
test.describe('Edit profile actions', () => {
  test('photo saved right away, Salvar and Voltar', async ({ page }, testInfo) => {
    await mockMissionarySession(
      page,
      page.context(),
      `e2e-edit-${testInfo.project.name}-${testInfo.repeatEachIndex}-${testInfo.retry}`
    );
    await page.goto('/profile/edit-profile');
    await page.waitForLoadState('networkidle');

    const photo = page.getByRole('img', { name: /^Foto de perfil de / }).filter({ visible: true });
    const toast = (text: string) => page.getByRole('status').filter({ hasText: text });
    const name = page.getByRole('textbox', { name: 'Nome completo:' });

    // Closing the confirmation saves nothing.
    await page
      .getByLabel('Adicionar foto de perfil')
      .locator('input[type="file"]')
      .setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG });
    const confirm = page.getByRole('dialog', { name: 'Usar esta foto?' });
    await confirm.getByRole('button', { name: 'Fechar' }).click();
    await expect(confirm).toBeHidden();
    await expect(photo).toHaveCount(0);

    // Confirming saves the photo without "Salvar".
    await page
      .getByLabel('Adicionar foto de perfil')
      .locator('input[type="file"]')
      .setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG });
    await confirm.getByRole('button', { name: 'Usar esta foto' }).click();
    await expect(toast('Foto de perfil adicionada com sucesso.')).toBeVisible({ timeout: 15000 });
    await expect(photo).toHaveAttribute('src', /\/storage\//);
    await expect(page).toHaveURL(/\/profile\/edit-profile$/);

    // A saved photo is not an unsaved change: "Voltar" is still a plain link.
    await expect(page.getByRole('link', { name: 'Voltar para o perfil' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancelar' })).toHaveCount(0);

    // "Voltar" with unsaved changes asks first.
    await name.fill('Outro nome');
    await page.getByRole('button', { name: 'Voltar para o perfil' }).click();
    const dialog = page.getByRole('dialog', { name: 'Descartar alterações não salvas?' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Continuar editando' }).click();
    await expect(dialog).toBeHidden();
    await expect(name).toHaveValue('Outro nome');

    await page.getByRole('button', { name: 'Voltar para o perfil' }).click();
    await page.getByRole('button', { name: 'Descartar e voltar' }).click();
    await expect(page).toHaveURL(/\/profile\/sobre$/);
    await expect(photo).toHaveAttribute('src', /\/storage\//);
  });
});
