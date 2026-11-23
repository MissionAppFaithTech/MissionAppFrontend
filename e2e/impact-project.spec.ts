import { test, expect, type Page } from '@playwright/test';
import { mockMissionarySession } from './support/session';

const PROJECT_ID = '018f0000-0000-7000-8000-000000000001';
const ASSET_ID = '018f0000-0000-7000-8000-000000000002';

const backendProject = {
  id: PROJECT_ID,
  title: 'Escola na Comunidade',
  description: 'Construção de uma escola comunitária no interior.',
  missionaryId: 'e2e-missionary',
  coverImageAssetId: ASSET_ID,
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  coverImage: { id: ASSET_ID, status: 'READY', url: '/images/projects/projeto-impacto.jpg' },
};

async function mockProjectList(page: Page, projects: unknown[]) {
  await page.route('**/api/impact-projects?*', (route) =>
    route.fulfill({ json: { data: projects, meta: { nextCursor: null, hasMore: false } } })
  );
}

test.describe('Impact project (owner) E2E', () => {
  // Owner pages need a session since src/proxy.ts; the BFF is mocked.
  test.beforeEach(async ({ page }) => {
    await mockMissionarySession(page);
  });

  test('shows the project loaded from the backend and links to the edit page', async ({ page }) => {
    await mockProjectList(page, [backendProject]);
    await page.goto('/profile/projetos-de-impacto');

    await expect(page.getByRole('heading', { name: /escola na comunidade/i })).toBeVisible();
    await expect(page.getByText(/vídeo de apresentação/i)).toBeVisible();
    await expect(page.locator('iframe')).toBeVisible();
    await expect(page.getByRole('button', { name: /ofertar/i })).toBeVisible();

    await page.goto('/profile/projetos-de-impacto/edit');
    await expect(page.getByRole('heading', { name: /editar projeto de impacto/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /alterar foto de capa/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /excluir projeto/i })).toBeVisible();
  });

  test('creates a project: reserves the upload, sends the cover and posts the project', async ({
    page,
  }) => {
    await mockProjectList(page, []);

    const calls: string[] = [];
    await page.route('**/api/media-assets/uploads', (route) => {
      calls.push('reserve');
      return route.fulfill({
        json: {
          data: {
            mediaAsset: { id: ASSET_ID, status: 'PENDING_UPLOAD', url: null },
            upload: {
              url: 'https://storage.e2e.test/put?sig=1',
              method: 'PUT',
              headers: { 'Content-Type': 'image/png' },
            },
          },
        },
      });
    });
    await page.route('https://storage.e2e.test/**', (route) => {
      calls.push('put');
      return route.fulfill({ status: 200, body: '' });
    });
    await page.route('**/api/media-assets/*/completion', (route) => {
      calls.push('complete');
      return route.fulfill({ status: 202, json: { data: { mediaAsset: { id: ASSET_ID } } } });
    });
    let createBody: unknown;
    await page.route('**/api/impact-projects', (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      calls.push('create');
      createBody = route.request().postDataJSON();
      return route.fulfill({ status: 201, json: { data: { impactProject: backendProject } } });
    });

    await page.goto('/profile/projetos-de-impacto/edit');
    await expect(page.getByRole('heading', { name: /criar projeto de impacto/i })).toBeVisible();

    await page.getByLabel(/título do projeto/i).fill('Escola na Comunidade');
    await page.getByLabel(/descrição detalhada/i).fill('Construção de uma escola.');
    await page.getByLabel(/link do vídeo/i).fill('https://youtu.be/dQw4w9WgXcQ');
    await page.getByLabel(/upload de foto de capa/i).setInputFiles({
      name: 'capa.png',
      mimeType: 'image/png',
      buffer: Buffer.from('png'),
    });
    await page.getByRole('button', { name: /criar projeto/i }).click();

    await expect.poll(() => calls).toEqual(['reserve', 'put', 'complete', 'create']);
    expect(createBody).toEqual({
      title: 'Escola na Comunidade',
      description: 'Construção de uma escola.',
      coverImageAssetId: ASSET_ID,
      videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
    });
    await expect(page).toHaveURL(/\/profile\/projetos-de-impacto$/);
  });

  test('requires a cover image when creating', async ({ page }) => {
    await mockProjectList(page, []);
    await page.goto('/profile/projetos-de-impacto/edit');

    await page.getByLabel(/título do projeto/i).fill('Escola');
    await page.getByLabel(/descrição detalhada/i).fill('Descrição');
    await page.getByRole('button', { name: /criar projeto/i }).click();

    await expect(page.getByText(/selecione uma foto de capa/i)).toBeVisible();
  });
});
