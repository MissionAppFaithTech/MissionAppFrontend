import { expect, test } from '@playwright/test';
import { mockMissionarySession } from './support/session';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

// "Editar perfil": the photo is only staged until "Salvar"; "Cancelar" undoes
// it; both stay on the page with a toast; "Voltar" asks before dropping changes.
test.describe('Edit profile actions', () => {
  test('staged photo, Cancelar, Salvar and Voltar', async ({ page }, testInfo) => {
    await mockMissionarySession(
      page,
      page.context(),
      `e2e-edit-${testInfo.project.name}-${testInfo.repeatEachIndex}-${testInfo.retry}`
    );
    await page.goto('/profile/edit-profile');
    await page.waitForLoadState('networkidle');

    const photo = page.getByRole('img', { name: /^Foto de perfil de / });
    const toast = (text: string) => page.getByRole('status').filter({ hasText: text });
    const pick = () =>
      page
        .getByLabel(/(Adicionar|Alterar) foto de perfil/)
        .locator('input[type="file"]')
        .setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: PNG });

    // Picking only previews the photo.
    await pick();
    await expect(photo).toHaveAttribute('src', /^blob:/);
    await expect(
      page.getByText('Nova foto selecionada. Ela será salva quando você clicar em Salvar.')
    ).toBeVisible();

    // "Cancelar" undoes it, says so and stays.
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(toast('Alterações descartadas.')).toBeVisible();
    await expect(photo).toHaveCount(0);
    await expect(page).toHaveURL(/\/profile\/edit-profile$/);

    // "Salvar" applies it with a green toast and stays.
    await pick();
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(toast('Foto de perfil adicionada com sucesso.')).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/\/profile\/edit-profile$/);
    await expect(photo).toHaveAttribute('src', /\/storage\//);

    // "Voltar" with unsaved changes asks first.
    await page.getByRole('textbox', { name: 'Nome completo:' }).fill('Outro nome');
    await page.getByRole('button', { name: 'Voltar para o perfil' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Descartar alterações não salvas?' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Continuar editando' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('textbox', { name: 'Nome completo:' })).toHaveValue('Outro nome');

    await page.getByRole('button', { name: 'Voltar para o perfil' }).last().click();
    await page.getByRole('button', { name: 'Descartar e voltar' }).click();
    await expect(page).toHaveURL(/\/profile\/sobre$/);
    await expect(photo.filter({ visible: true })).toHaveAttribute('src', /\/storage\//);
  });
});
