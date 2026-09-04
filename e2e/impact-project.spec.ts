import { test, expect } from '@playwright/test';

test.describe('Impact Project & Edit Flow E2E', () => {
  test('displays impact project, opens lightbox photo viewer and navigates to edit page', async ({
    page,
  }) => {
    // Navigate directly to missionary impact projects page
    await page.goto('/profile/projetos-de-impacto');

    // Heading of the impact project
    await expect(page.getByRole('heading', { name: /projeto social na favela do lixão/i })).toBeVisible();

    // YouTube presentation video
    await expect(page.getByText(/vídeo de apresentação/i)).toBeVisible();
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();

    // Photo carousel
    await expect(page.getByText(/fotos do projeto/i)).toBeVisible();

    // Ofertar button
    const ofertarBtn = page.getByRole('button', { name: /ofertar/i });
    await expect(ofertarBtn).toBeVisible();

    // Navigate to edit impact project page
    await page.goto('/profile/projetos-de-impacto/edit');
    await expect(page.getByRole('heading', { name: /editar projeto de impacto/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /alterar foto de capa/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /adicionar fotos do dispositivo/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /salvar/i })).toBeVisible();
  });
});
