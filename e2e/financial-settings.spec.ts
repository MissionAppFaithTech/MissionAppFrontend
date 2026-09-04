import { test, expect } from '@playwright/test';

test.describe('Missionary Financial Settings E2E Flow', () => {
  test('navigates to financial settings, checks cards, previews donor modal and saves', async ({
    page,
  }) => {
    // 1. Navigate directly to financial settings route
    await page.goto('/profile/financeiro');

    // 2. Check Header & Status Badge
    await expect(
      page.getByRole('heading', { level: 1, name: /configurações financeiras/i })
    ).toBeVisible();
    await expect(page.getByText(/status: ativo/i)).toBeVisible();
    await expect(page.getByText(/ambiente seguro/i)).toBeVisible();

    // 3. Check Supporter Message section and live preview
    const messageInput = page.getByLabel(/mensagem de gratidão e direcionamento/i);
    await expect(messageInput).toBeVisible();
    await expect(page.getByText(/prévia ao vivo no modal de doação:/i)).toBeVisible();

    // 4. Check Pix Simples and Bank Transfer Cards
    await expect(page.getByText(/doação via pix simples/i)).toBeVisible();
    await expect(
      page.getByText(/transferência bancária \(ted \/ doc \/ mesma instituição\)/i)
    ).toBeVisible();

    // 5. Open Supporter Preview Modal
    const previewBtn = page.getByRole('button', { name: /visualizar prévia do apoiador/i });
    await expect(previewBtn).toBeVisible();
    await previewBtn.click();

    // Verify modal is open and shows preview banner
    await expect(page.getByRole('heading', { name: /ofertar na missão/i })).toBeVisible();
    await expect(
      page.getByText(/você está visualizando a experiência de oferta exatamente como seus apoiadores verão/i)
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /copiar chave pix/i })).toBeVisible();

    // Switch to Bank Transfer tab in modal
    const bankTab = page.getByRole('tab', { name: /transferência bancária/i });
    await bankTab.click();
    await expect(page.getByText(/dados da conta para transferência:/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /copiar todos os dados bancários/i })
    ).toBeVisible();

    // Close preview modal
    const closeBtn = page.getByRole('button', { name: /fechar/i });
    await closeBtn.click();
    await expect(page.getByRole('heading', { name: /ofertar na missão/i })).not.toBeVisible();

    // 6. Save configurations and verify toast
    const saveBtn = page.getByRole('button', { name: /salvar configurações/i });
    await saveBtn.click();
    await expect(
      page.getByText(/configurações financeiras salvas com sucesso!/i)
    ).toBeVisible();
  });

  test('navigates to financial settings from missionary profile summary card', async ({
    page,
  }) => {
    await page.goto('/profile/projetos-de-impacto');

    // Click on "Configurar Doações" in the missionary profile header card
    const configBtn = page.getByRole('link', { name: /configurar doações/i });
    await expect(configBtn).toBeVisible();
    await configBtn.click();

    await page.waitForURL('**/profile/financeiro');
    await expect(
      page.getByRole('heading', { level: 1, name: /configurações financeiras/i })
    ).toBeVisible();
  });
});
