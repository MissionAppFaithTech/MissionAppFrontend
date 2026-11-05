import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mockMissionarySession } from './support/session';

/** Sessions screen (ADR-0007): one entry per device, "Encerrar" on the other devices. */

function sessionsSection(page: Page) {
  return page.getByRole('region', { name: 'Sessões ativas' }).filter({ visible: true });
}

test.describe('Sessões ativas', () => {
  test('lists this computer and the phone, and ends the phone session', async ({
    page,
  }, testInfo) => {
    await mockMissionarySession(page, page.context(), `e2e-sessions-${testInfo.project.name}`);
    await page.goto('/profile/configuracoes');

    const section = sessionsSection(page);
    const items = section.getByRole('listitem');
    await expect(items).toHaveCount(2);

    const current = items.filter({ hasText: 'Este aparelho' });
    await expect(current).toContainText('Chrome no Windows');
    await expect(current).toContainText('Computador · Conectado desde');
    await expect(current.getByRole('button')).toHaveCount(0);

    const phone = items.filter({ hasText: 'Mobile Safari no iOS' });
    await expect(phone).toContainText('Celular · Conectado desde');
    await phone.getByRole('button', { name: 'Encerrar sessão: Mobile Safari no iOS' }).click();

    const dialog = page.getByRole('dialog', { name: 'Encerrar esta sessão?' });
    await expect(dialog).toContainText('Mobile Safari no iOS (celular) será desconectado');
    await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeFocused();

    // Audit the settled dialog: mid fade-in, axe measures blended colors.
    await page.waitForFunction(() =>
      document.getAnimations().every((animation) => animation.playState !== 'running')
    );
    const axe = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
    expect(axe.violations).toEqual([]);

    await dialog.getByRole('button', { name: 'Encerrar sessão' }).click();

    await expect(dialog).toBeHidden();
    await expect(items).toHaveCount(1);
    await expect(section).not.toContainText('Mobile Safari no iOS');
    await expect(page.getByText('Sessão encerrada: Mobile Safari no iOS.')).toBeVisible();
  });

  test('Escape closes the confirmation without ending the session', async ({ page }, testInfo) => {
    await mockMissionarySession(page, page.context(), `e2e-sessions-esc-${testInfo.project.name}`);
    await page.goto('/profile/configuracoes');

    const trigger = sessionsSection(page).getByRole('button', {
      name: 'Encerrar sessão: Mobile Safari no iOS',
    });
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');

    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(sessionsSection(page).getByRole('listitem')).toHaveCount(2);
  });

  test('fits a 360 px phone: no horizontal scroll, full-width buttons', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await mockMissionarySession(page, page.context(), `e2e-sessions-360-${testInfo.project.name}`);
    await page.goto('/profile/configuracoes');

    const section = sessionsSection(page);
    const button = section.getByRole('button', { name: 'Encerrar sessão: Mobile Safari no iOS' });
    await expect(button).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);

    const buttonBox = await button.boundingBox();
    const itemBox = await section
      .getByRole('listitem')
      .filter({ hasText: 'Mobile Safari no iOS' })
      .boundingBox();
    expect(buttonBox!.height).toBeGreaterThanOrEqual(44);
    expect(buttonBox!.width).toBeGreaterThan(itemBox!.width * 0.8);
  });
});

test.describe('Aparelho no login', () => {
  test('logging in again in the same browser keeps a single session', async ({
    page,
  }, testInfo) => {
    // NOTE: a login of its own, so other specs' logins never show up in this list.
    const email = `samuel+relogin-${testInfo.project.name.replace(/\W+/g, '-')}@privado.test`;
    const login = async () => {
      await page.goto('/login');
      await page.getByRole('textbox', { name: 'E-mail' }).fill(email);
      await page.getByRole('textbox', { name: 'Senha' }).fill('Senha@123');
      await page.getByRole('button', { name: 'Entrar' }).click();
      await expect(page).toHaveURL(/\/profile\/sobre$/);
    };

    await login();
    const deviceCookie = (await page.context().cookies()).find((c) => c.name === 'ma_device_id');
    expect(deviceCookie?.httpOnly).toBe(true);
    expect(deviceCookie?.value).toMatch(/^[\w-]{16,128}$/);

    await page.context().clearCookies({ name: 'ma_access_token' });
    await page.context().clearCookies({ name: 'ma_refresh_token' });
    await login();

    const sameDevice = (await page.context().cookies()).find((c) => c.name === 'ma_device_id');
    expect(sameDevice?.value).toBe(deviceCookie?.value);

    await page.goto('/profile/configuracoes');
    const items = sessionsSection(page).getByRole('listitem');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('Este aparelho');
  });
});
