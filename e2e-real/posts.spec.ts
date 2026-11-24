import { expect, test } from '@playwright/test';
import { backendEnvFile } from './support/stack.mjs';

// Runs only against the disposable app_e2e stack, never a developer's database.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);
const photo = (name: string) => ({ name, mimeType: 'image/png', buffer: PNG });

test('post CRUD through the BFF, real signed uploads and media processing', async ({
  page,
}, info) => {
  const email =
    info.project.name === 'chromium'
      ? 'missionary1@missionapp.test'
      : 'missionary2@missionapp.test';
  const caption = `Atualização do campo ${info.project.name} ${Date.now()}`;
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'E-mail' }).fill(email);
  await page
    .getByRole('textbox', { name: 'Senha' })
    .fill(backendEnvFile().SEED_USER_PASSWORD ?? 'password123');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/profile\//);
  await page.goto('/profile/posts');
  await page.getByRole('button', { name: 'Postar', exact: true }).click();
  await page.getByRole('textbox', { name: /legenda/i }).fill(caption);
  await page.getByRole('textbox', { name: 'Link opcional' }).fill('https://example.org/mission');
  await page
    .getByLabel('Selecionar imagens')
    .setInputFiles([photo('1.png'), photo('2.png'), photo('3.png')]);
  const puts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'PUT') puts.push(request.url());
  });
  await page.getByRole('button', { name: 'Publicar', exact: true }).click();
  const article = page.getByRole('article').filter({ hasText: caption });
  await expect(article).toBeVisible({ timeout: 30000 });
  expect(puts).toHaveLength(3);
  const response = await page.request.get('/api/posts?limit=20');
  expect(response.ok()).toBeTruthy();
  const post = (await response.json()).data.posts.find(
    (entry: { content: string }) => entry.content === caption
  );
  expect(post.images).toHaveLength(3);
  expect(post.highlightLink).toBe('https://example.org/mission');
  await expect(article.getByRole('link', { name: /Abrir link:/ })).toHaveAttribute(
    'href',
    'https://example.org/mission'
  );
  await expect(article.getByRole('img', { name: /Imagem \d da postagem/ })).toHaveCount(3, {
    timeout: 30000,
  });
  await expect
    .poll(() =>
      article
        .getByRole('img', { name: /Imagem \d da postagem/ })
        .first()
        .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)
    )
    .toBe(true);
  const removedImageUrl = await article
    .getByRole('img', { name: 'Imagem 2 da postagem', exact: true })
    .getAttribute('src');
  expect(removedImageUrl).toMatch(/^http.*\.optimized\.webp$/);
  await article.getByRole('button', { name: 'Editar postagem' }).click();
  await page.getByRole('button', { name: 'Remover imagem 2' }).click();
  await page.getByLabel('Selecionar imagens').setInputFiles(photo('nova.png'));
  await page.getByRole('textbox', { name: /legenda/i }).fill(`${caption} editada`);
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(article).toContainText(`${caption} editada`);
  expect(puts).toHaveLength(4);
  const updated = await (await page.request.get(`/api/posts/${post.id}`)).json();
  expect(updated.data.post.highlightLink).toBe('https://example.org/mission');
  expect(
    updated.data.post.images
      .slice(0, 2)
      .map((entry: { imageAssetId: string }) => entry.imageAssetId)
  ).toEqual([post.images[0].imageAssetId, post.images[2].imageAssetId]);
  // Check the worker's real deletion, not just removal from the serialized post.
  await expect
    .poll(async () => (await page.request.get(removedImageUrl!)).status(), { timeout: 30000 })
    .toBe(404);
  await expect(article.getByRole('img', { name: /Imagem \d da postagem/ })).toHaveCount(3, {
    timeout: 30000,
  });
  const remainingImageUrls = await article
    .getByRole('img', { name: /Imagem \d da postagem/ })
    .evaluateAll((images) => images.map((image) => (image as HTMLImageElement).src));
  await page.reload();
  await article.getByRole('button', { name: 'Excluir postagem' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Excluir postagem' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(article).toHaveCount(0);
  expect((await page.request.get(`/api/posts/${post.id}`)).status()).toBe(404);
  for (const url of remainingImageUrls) {
    await expect
      .poll(async () => (await page.request.get(url)).status(), { timeout: 30000 })
      .toBe(404);
  }
});
