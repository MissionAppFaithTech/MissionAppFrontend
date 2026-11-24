import { expect, test, type Page, type APIRequestContext } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockMissionarySession } from './support/session';
const API = `http://localhost:${process.env.E2E_MOCK_API_PORT || '3335'}`;
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);
const photo = (name = 'foto.png') => ({ name, mimeType: 'image/png', buffer: PNG });
async function control(request: APIRequestContext, sub: string, data?: object) {
  const response = data
    ? await request.post(`${API}/__test/posts/${sub}`, { data })
    : await request.get(`${API}/__test/posts/${sub}`);
  expect(response.ok()).toBeTruthy();
  return response.json();
}
async function start(page: Page, sub: string) {
  await mockMissionarySession(page, page.context(), sub);
  await page.goto('/profile/posts');
  await page.getByRole('button', { name: 'Postar', exact: true }).click();
}
async function caption(page: Page, content: string) {
  await page.getByRole('textbox', { name: /legenda/i }).fill(content);
}
async function published(page: Page, content: string) {
  await page.getByRole('button', { name: 'Publicar', exact: true }).click();
  await expect(page.getByRole('article').filter({ hasText: content })).toBeVisible();
}

test('CRUD uses actual requests, preserves retained IDs and updates after reload', async ({
  page,
  request,
}, info) => {
  const sub = `posts-crud-${info.project.name}`;
  await start(page, sub);
  await caption(page, 'Notícias do campo');
  await page.getByLabel('Link opcional').fill('https://www.youtube.com/watch?v=abcdefghijk');
  await page
    .getByLabel('Selecionar imagens')
    .setInputFiles([photo('1.png'), photo('2.png'), photo('3.png')]);
  await published(page, 'Notícias do campo');
  let state = await control(request, sub);
  expect(state.uploads).toBe(3);
  expect(state.requests).toHaveLength(1);
  const original = state.posts[0].images.map(
    (image: { imageAssetId: string }) => image.imageAssetId
  );
  await page.reload();
  await expect(page.getByRole('article')).toContainText('Notícias do campo');
  const external = page.getByRole('link', { name: /Abrir link/ });
  await expect(external).toHaveAttribute('rel', 'noopener noreferrer');
  await page.getByRole('button', { name: 'Editar postagem' }).click();
  await caption(page, 'Legenda atualizada <script>alert(1)</script>');
  await page.getByRole('button', { name: 'Remover imagem 2' }).click();
  await page.getByLabel('Selecionar imagens').setInputFiles(photo('nova.png'));
  await page.getByLabel('Link opcional').fill('');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByRole('article')).toContainText(
    'Legenda atualizada <script>alert(1)</script>'
  );
  state = await control(request, sub);
  expect(state.uploads).toBe(4);
  expect(state.requests[1].method).toBe('PATCH');
  expect(state.requests[1].body.imageAssetIds.slice(0, 2)).toEqual([original[0], original[2]]);
  expect(state.requests[1].body.imageAssetIds).toHaveLength(3);
  expect(state.requests[1].body.highlightLink).toBeNull();
  expect(await page.locator('article script').count()).toBe(0);
  await page.getByRole('button', { name: 'Excluir postagem' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Excluir postagem' })).toBeFocused();
  expect((await control(request, sub)).requests).toHaveLength(2);
  await page.getByRole('button', { name: 'Excluir postagem' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Excluir postagem' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('article')).toHaveCount(0);
  expect((await control(request, sub)).requests.at(-1).method).toBe('DELETE');
});

test('empty caption, 4 images, invalid media and failed uploads never publish', async ({
  page,
  request,
}, info) => {
  const sub = `posts-validation-${info.project.name}`;
  await start(page, sub);
  await page.getByRole('button', { name: 'Publicar', exact: true }).click();
  await expect(page.getByRole('textbox', { name: /legenda/i })).toBeFocused();
  await expect(page.getByRole('textbox', { name: /legenda/i })).toHaveAttribute(
    'aria-invalid',
    'true'
  );
  await page.getByLabel('Selecionar imagens').setInputFiles([photo(), photo(), photo(), photo()]);
  await expect(page.getByText('Escolha até 3 imagens por postagem')).toBeVisible();
  await page
    .getByLabel('Selecionar imagens')
    .setInputFiles({ name: 'bad.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await expect(page.getByText('Escolha JPG, PNG ou WebP')).toBeVisible();
  await control(request, sub, { uploadFail: true });
  await caption(page, 'Envio falho');
  await page.getByLabel('Selecionar imagens').setInputFiles(photo());
  await page.getByRole('button', { name: 'Publicar', exact: true }).click();
  await expect(page.getByText('Falha no envio; tente novamente ou remova')).toBeVisible();
  expect((await control(request, sub)).requests).toHaveLength(0);
  await control(request, sub, {});
  await published(page, 'Envio falho');
});

test('50-image limit cancellation never retries; explicit confirmation preserves old text', async ({
  page,
  request,
}, info) => {
  const sub = `posts-limit-${info.project.name}`;
  await control(request, sub, { seedImages: 50 });
  await start(page, sub);
  await caption(page, 'Nova imagem autorizada');
  await page.getByLabel('Selecionar imagens').setInputFiles(photo());
  await page.getByRole('button', { name: 'Publicar', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Limite de 50 imagens atingido' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Manter imagens antigas' })).toBeFocused();
  expect((await control(request, sub)).requests).toHaveLength(1);
  await dialog.getByRole('button', { name: 'Manter imagens antigas' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Publicar', exact: true })).toBeFocused();
  expect((await control(request, sub)).requests).toHaveLength(1);
  await page.getByRole('button', { name: 'Publicar', exact: true }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Substituir imagens antigas' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole('article').filter({ hasText: 'Nova imagem autorizada' })
  ).toBeVisible();
  const state = await control(request, sub);
  expect(state.requests).toHaveLength(3);
  expect(state.requests[0].body.replaceOldestImages).toBeUndefined();
  expect(state.requests[1].body.replaceOldestImages).toBeUndefined();
  expect(state.requests[2].body.replaceOldestImages).toBe(true);
  expect(state.uploads).toBe(1);
  expect(state.posts).toHaveLength(18);
  expect(state.posts[0].content).toBe('Texto preservado 1');
  expect(
    state.posts.reduce(
      (count: number, post: { images: unknown[] }) => count + post.images.length,
      0
    )
  ).toBe(50);
});

for (const status of [403, 409, 422])
  test(`generic ${status} preserves the draft and never authorizes replacement`, async ({
    page,
    request,
  }, info) => {
    const sub = `posts-error-${status}-${info.project.name}`;
    await control(request, sub, { error: status });
    await start(page, sub);
    await caption(page, 'Meu texto preservado');
    await page.getByRole('button', { name: 'Publicar', exact: true }).click();
    await expect(page.getByRole('textbox', { name: /legenda/i })).toHaveValue(
      'Meu texto preservado'
    );
    await expect(
      page
        .getByRole('alert')
        .filter({ hasText: `Erro de postagem ${status}` })
        .first()
    ).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect((await control(request, sub)).requests).toHaveLength(1);
  });

test('owner filter, cursor pagination, foreign permissions and 320px/1280px accessibility', async ({
  page,
  request,
}, info) => {
  const sub = `posts-feed-${info.project.name}`;
  await control(request, sub, { seedPosts: 21, foreign: true });
  await mockMissionarySession(page, page.context(), sub);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/profile/posts');
  await expect(page.getByRole('article')).toHaveCount(20);
  await page.getByRole('button', { name: 'Carregar mais postagens' }).click();
  await expect(page.getByRole('article')).toHaveCount(21);
  await page.getByRole('tab', { name: 'Geral', exact: true }).click();
  const foreign = page.getByRole('article').filter({ hasText: 'Publicação de outro missionário' });
  await expect(foreign).toBeVisible();
  await expect(foreign.getByRole('button', { name: /Editar|Excluir/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Postar', exact: true }).click();
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
    const findings = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      findings.violations.filter((violation) =>
        ['serious', 'critical'].includes(violation.impact ?? '')
      )
    ).toEqual([]);
    await page.screenshot({ path: info.outputPath(`posts-${width}.png`), fullPage: true });
  }
});
