import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Typo-tolerant catalog search against the real backend (ADR-0042) and the
 * seeded catalogs (`CatalogSeeder`): missing words, words out of order, and
 * missing, wrong or swapped letters still find the item. The spec only
 * searches; it creates no data.
 */

const JOCUM = 'JOCUM Brasil (Jovens Com Uma Missão)';
const BAPTIST_CHURCHES = [
  'Igreja Batista da Lagoinha',
  'Primeira Igreja Batista de Curitiba',
  'Primeira Igreja Batista do Rio de Janeiro',
];

const visible = <T extends { filter: (o: { visible: boolean }) => T }>(locator: T) =>
  locator.filter({ visible: true });

const field = (page: Page, name: RegExp) => visible(page.getByRole('textbox', { name }));
const combobox = (page: Page, name: RegExp) => visible(page.getByRole('combobox', { name }));
const options = (page: Page) => visible(page.getByRole('listbox')).getByRole('option');

/** Fills step 1 (no API calls) and lands on the step with the catalog fields. */
async function openMinistryStep(page: Page) {
  await page.goto('/register/missionaries');
  await field(page, /nome completo/i).fill('João Missionário');
  await field(page, /e-mail/i).fill('joao.busca@missionapp.test');
  await field(page, /data de nascimento/i).fill('10051990');
  await visible(page.getByRole('radio', { name: 'Masculino' })).check();
  await field(page, /cpf ou passaporte/i).fill('52998224725');
  await field(page, /telefone/i).fill('21987654321');
  await visible(page.getByRole('button', { name: 'Continuar' })).click();
  await expect(visible(page.getByRole('heading', { level: 2 }))).toContainText(
    'Dados ministeriais'
  );
}

/** Types like a person (debounced search) and waits for that term's results. */
async function search(page: Page, name: RegExp, term: string) {
  const input = combobox(page, name);
  await input.fill('');
  const response = page.waitForResponse(
    (r) => new URL(r.url()).searchParams.get('search') !== null && r.status() === 200
  );
  await input.pressSequentially(term, { delay: 30 });
  await response;
  return input;
}

test.describe('Busca de catálogos tolerante a erros (backend real)', () => {
  test('finds the agency with a wrong letter or missing words, and picks it', async ({ page }) => {
    await openMinistryStep(page);

    for (const term of ['jocun', 'jovens missao', 'missao jovens']) {
      await search(page, /agência missionária/i, term);
      await expect(options(page).first()).toHaveText(JOCUM);
    }

    await visible(page.getByRole('option', { name: JOCUM })).click();
    await expect(combobox(page, /agência missionária/i)).toHaveValue(JOCUM);
  });

  test('finds the churches with missing or swapped letters, "+ Adicionar" last', async ({
    page,
  }) => {
    await openMinistryStep(page);

    for (const term of ['batsita', 'igrja batista']) {
      await search(page, /comunidade de fé/i, term);
      const names = options(page);
      await expect(names).toHaveText([...BAPTIST_CHURCHES, /Adicionar Comunidade de Fé/]);
    }

    await search(page, /comunidade de fé/i, 'lagoina');
    await expect(options(page).first()).toHaveText('Igreja Batista da Lagoinha');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('an unrelated term finds nothing and offers "+ Adicionar"', async ({ page }) => {
    await openMinistryStep(page);

    await search(page, /agência missionária/i, 'xqzwv');
    await expect(
      visible(page.getByRole('option', { name: 'Nenhuma agência missionária encontrada.' }))
    ).toBeVisible();
    await expect(options(page).last()).toHaveText(/Adicionar Agência Missionária/);
  });
});
