import { test, expect } from '@playwright/test';

test.describe('Missionary Campaign & Dedicated Campaign Page E2E Flow', () => {
  test('navigates to missionary campaign tab, checks layout, carousel and opens Ofertar modal', async ({
    page,
  }) => {
    // 1. Visit missionary campaign tab
    await page.goto('/profile/campanha');

    // 2. Check Campaign Badge & Titles
    await expect(page.getByText('Selo Oficial de Campanha')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Campanha de Educação & Esperança' })
    ).toBeVisible();
    await expect(
      page.getByText(/mobilizando comunidades de fé para transformar a infância/i)
    ).toBeVisible();

    // 3. Check Official Church Day
    await expect(page.getByText(/dia oficial nas igrejas: 20 de outubro de 2026/i)).toBeVisible();

    // 4. Check Ofertar button and modal
    const ofertarBtn = page.getByRole('button', { name: /ofertar na campanha/i });
    await expect(ofertarBtn).toBeVisible();
    await ofertarBtn.click();

    // Verify Donation Modal opened
    await expect(page.getByRole('heading', { name: /ofertar na missão/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /copiar chave pix/i })).toBeVisible();

    // Close modal
    const closeBtn = page.getByRole('button', { name: /fechar/i });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }

    // 5. Navigate to Dedicated Campaign Page
    const verPaginaBtn = page.getByRole('link', { name: /ver página da campanha/i });
    await expect(verPaginaBtn).toBeVisible();
    await verPaginaBtn.click();

    await page.waitForURL('**/campanha/campanha-educacao-esperanca');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Campanha de Educação & Esperança' })
    ).toBeVisible();

    // Verify linked impact projects section
    await expect(
      page.getByRole('heading', { name: /projetos de impacto vinculados/i })
    ).toBeVisible();
    await expect(page.getByText('Projeto social na favela do Lixão')).toBeVisible();
  });
});
