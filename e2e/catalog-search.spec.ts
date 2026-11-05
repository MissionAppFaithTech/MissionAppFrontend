import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mockMissionarySession } from './support/session';

/**
 * Agency and faith community fields search the catalog on the server as the
 * user types (backend ADR-0041): one request per pause, accents and case
 * ignored, "+ Adicionar …" to register what is missing. A CPF already in use
 * comes back on the CPF field of the first step.
 */

const visible = <T extends { filter: (o: { visible: boolean }) => T }>(locator: T) =>
  locator.filter({ visible: true });

const field = (page: Page, name: RegExp) => visible(page.getByRole('textbox', { name }));
const combobox = (page: Page, name: RegExp) => visible(page.getByRole('combobox', { name }));

async function fillPersonalData(page: Page, document: string) {
  await field(page, /nome completo/i).fill('João Missionário');
  await field(page, /e-mail/i).fill(`joao.${Date.now() % 100000}@missionapp.test`);
  await field(page, /data de nascimento/i).fill('10051990');
  await visible(page.getByRole('radio', { name: 'Masculino' })).check();
  await field(page, /cpf ou passaporte/i).fill(document);
  await field(page, /telefone/i).fill('21987654321');
  await visible(page.getByRole('button', { name: 'Continuar' })).click();
  await expect(visible(page.getByRole('heading', { level: 2 }))).toContainText(
    'Dados ministeriais'
  );
}

/** Counts the BFF searches of a catalog made after this call. */
function countSearches(page: Page, path: string) {
  const terms: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname === path && request.method() === 'GET') {
      terms.push(url.searchParams.get('search') ?? '');
    }
  });
  return terms;
}

test.describe('Busca de agências e comunidades de fé', () => {
  test('searches on the server once per pause, ignoring accents, and picks a result', async ({
    page,
  }) => {
    await page.goto('/register/missionaries');
    await fillPersonalData(page, '52998224725');
    const searches = countSearches(page, '/api/missionary-agencies');

    const agency = combobox(page, /agência missionária/i);
    await agency.click();
    await expect(
      visible(page.getByRole('option', { name: 'Digite ao menos 2 letras para buscar.' }))
    ).toBeVisible();
    await agency.pressSequentially('MISSOES', { delay: 40 });

    await expect(visible(page.getByRole('option', { name: 'Missões Unidas 01' }))).toBeVisible();
    // 11 matches, 10 per page: the list asks to narrow the search.
    await expect(
      visible(
        page.getByRole('option', { name: 'Continue digitando para encontrar outros resultados.' })
      )
    ).toBeVisible();
    expect(searches).toEqual(['missoes']);

    await visible(page.getByRole('option', { name: 'Missões Unidas 03' })).click();
    await expect(agency).toHaveValue('Missões Unidas 03');
    // The picked name is not searched again.
    await page.waitForTimeout(500);
    expect(searches).toEqual(['missoes']);
  });

  test('"+ Adicionar" opens the sign-up modal with the typed name when nothing matches', async ({
    page,
  }) => {
    await page.goto('/register/missionaries');
    await fillPersonalData(page, '52998224725');

    const community = combobox(page, /comunidade de fé/i);
    await community.fill('Comunidade Inexistente');
    await expect(
      visible(page.getByRole('option', { name: 'Nenhuma comunidade de fé encontrada.' }))
    ).toBeVisible();
    await visible(page.getByRole('option', { name: /Adicionar Comunidade de Fé/ })).click();

    const dialog = page.getByRole('dialog', { name: /cadastrar comunidade de fé/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('textbox', { name: /^nome$/i })).toHaveValue(
      'Comunidade Inexistente'
    );
  });

  test('a CPF already in use brings the user back to the CPF field', async ({ page }) => {
    await page.goto('/register/missionaries');
    await fillPersonalData(page, '111.444.777-35');

    const agency = combobox(page, /agência missionária/i);
    await agency.fill('jocum');
    await visible(page.getByRole('option', { name: 'JOCUM' })).click();
    await field(page, /projeto ou atuação missionária/i).fill('Evangelismo no sertão');
    const community = combobox(page, /comunidade de fé/i);
    await community.fill('igreja batista');
    await visible(page.getByRole('option', { name: 'Igreja Batista Central' })).click();
    await visible(page.getByRole('button', { name: 'Continuar' })).click();

    await field(page, /nome de usuário/i).fill(`joao_${Date.now() % 100000}`);
    await visible(page.getByLabel(/^senha/i)).fill('SenhaForte@123');
    await visible(page.getByLabel(/confirmar senha/i)).fill('SenhaForte@123');
    await visible(page.getByRole('button', { name: 'Finalizar cadastro' })).click();

    await expect(visible(page.getByRole('heading', { level: 2 }))).toContainText('Dados pessoais');
    const summary = visible(page.locator('form').getByRole('alert'));
    await expect(summary).toBeFocused();
    await expect(summary).toContainText('CPF ou passaporte: Este CPF já está cadastrado.');
    const document = field(page, /cpf ou passaporte/i);
    await expect(document).toHaveAttribute('aria-invalid', 'true');
    await expect(document).toHaveAccessibleDescription(/Este CPF já está cadastrado\./);
  });

  test('a successful sign-up shows the pending review screen with its actions', async ({
    page,
  }) => {
    await page.goto('/register/missionaries');
    await fillPersonalData(page, '52998224725');

    await combobox(page, /agência missionária/i).fill('jocum');
    await visible(page.getByRole('option', { name: 'JOCUM' })).click();
    await field(page, /projeto ou atuação missionária/i).fill('Evangelismo no sertão');
    await combobox(page, /comunidade de fé/i).fill('igreja batista');
    await visible(page.getByRole('option', { name: 'Igreja Batista Central' })).click();
    await visible(page.getByRole('button', { name: 'Continuar' })).click();

    await field(page, /nome de usuário/i).fill(`joao_ok_${Date.now() % 100000}`);
    await visible(page.getByLabel(/^senha/i)).fill('SenhaForte@123');
    await visible(page.getByLabel(/confirmar senha/i)).fill('SenhaForte@123');
    await visible(page.getByRole('button', { name: 'Finalizar cadastro' })).click();

    await expect(visible(page.getByRole('heading', { name: 'Cadastro realizado!' }))).toBeVisible();
    await expect(visible(page.getByText('Seu cadastro será analisado'))).toBeVisible();
    // It stays (it used to vanish right after a remount).
    await page.waitForTimeout(1000);
    await expect(visible(page.getByRole('heading', { name: 'Cadastro realizado!' }))).toBeVisible();
    await expect(visible(page.getByRole('link', { name: /ir para início/i }))).toHaveAttribute(
      'href',
      '/'
    );
    await expect(visible(page.getByRole('link', { name: /ir para login/i }))).toHaveAttribute(
      'href',
      '/login'
    );
  });

  test('fits a 360 px phone with the list open, without accessibility violations', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/register/missionaries');
    await fillPersonalData(page, '52998224725');

    await combobox(page, /agência missionária/i).fill('missao');
    const option = visible(page.getByRole('option', { name: 'Missão Ágape' }));
    await expect(option).toBeVisible();
    expect((await option.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    const add = visible(page.getByRole('option', { name: /Adicionar Agência Missionária/ }));
    expect((await add.boundingBox())!.height).toBeGreaterThanOrEqual(44);

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

test.describe('Configurações — cadastrar agência que falta', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // One user per test: the specs run in parallel and save links.
    const user = `e2e-catalog-${testInfo.title}-${testInfo.project.name}-${testInfo.repeatEachIndex}`;
    await mockMissionarySession(page, page.context(), user.replace(/\W+/g, '-'));
    await page.goto('/profile/configuracoes');
    // Type only after hydration, or React puts the saved name back.
    await page.waitForLoadState('networkidle');
  });

  async function fillAgencyModal(page: Page) {
    const dialog = page.getByRole('dialog', { name: /cadastrar agência missionária/i });
    await dialog.getByRole('textbox', { name: /^país/i }).fill('Brasil');
    await dialog.getByRole('textbox', { name: /^estado/i }).fill('PE');
    await dialog.getByRole('textbox', { name: /^cidade/i }).fill('Recife');
    await dialog.getByRole('textbox', { name: /^telefone$/i }).fill('81987654321');
    await dialog.getByRole('button', { name: /^salvar$/i }).click();
    return dialog;
  }

  test('registers the agency in the modal, finds it in the next search and links it', async ({
    page,
  }, testInfo) => {
    const name = `Agência E2E ${testInfo.project.name} ${Date.now() % 100000}`;

    const agency = combobox(page, /^agência missionária/i);
    await agency.fill(name);
    await visible(page.getByRole('option', { name: /Adicionar Agência Missionária/ })).click();
    await expect(
      page
        .getByRole('dialog', { name: /cadastrar agência missionária/i })
        .getByRole('textbox', { name: /^nome$/i })
    ).toHaveValue(name);
    const dialog = await fillAgencyModal(page);

    await expect(dialog).toBeHidden();
    await expect(agency).toHaveValue(name);
    await visible(page.getByRole('button', { name: 'Salvar Agência Missionária' })).click();
    await expect(page.getByText('Agência missionária atualizada com sucesso!')).toBeVisible();

    // The cached BFF search was expired by the create: the new agency is found.
    await agency.fill(name.toUpperCase());
    await expect(visible(page.getByRole('option', { name }))).toBeVisible();
  });

  test('keeps the modal open with an API field error on its field', async ({ page }) => {
    await combobox(page, /^agência missionária/i).fill('Cadastro Recusado');
    await visible(page.getByRole('option', { name: /Adicionar Agência Missionária/ })).click();
    await expect(
      page
        .getByRole('dialog', { name: /cadastrar agência missionária/i })
        .getByRole('textbox', { name: /^nome$/i })
    ).toHaveValue('Cadastro Recusado');
    const dialog = await fillAgencyModal(page);

    const nameField = dialog.getByRole('textbox', { name: /^nome$/i });
    await expect(nameField).toHaveAttribute('aria-invalid', 'true');
    await expect(nameField).toHaveAccessibleDescription('Este nome não é aceito.');
    await expect(nameField).toBeFocused();
    await expect(dialog).toBeVisible();
  });
});
