import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Automated Accessibility (a11y) Verification - WCAG 2.2 AA', () => {
  const publicRoutes = [
    { name: 'Landing Page', path: '/' },
    { name: 'Login Page', path: '/login' },
    { name: 'Forgot Password Page', path: '/forgot-password' },
    { name: 'Role Selection Page', path: '/select-role' },
    { name: 'Supporters Registration Page', path: '/register/supporters' },
    { name: 'Missionaries Registration Page', path: '/register/missionaries' },
    { name: 'Missionary Profile (Sobre)', path: '/profile/sobre' },
    { name: 'Missionary Profile (Campanha)', path: '/profile/campanha' },
    { name: 'Missionary Profile (Projetos de Impacto)', path: '/profile/projetos-de-impacto' },
    { name: 'Missionary Profile (Financial Settings)', path: '/profile/financeiro' },
    { name: 'Supporter Profile (Following)', path: '/profile/supporter/missionarios' },
    { name: 'Supporter Profile (Saved Posts)', path: '/profile/supporter/postagens-salvas' },
  ];

  for (const route of publicRoutes) {
    test(`route ${route.name} (${route.path}) satisfies WCAG 2.2 AA accessibility standards`, async ({
      page,
    }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .exclude('iframe')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        const simplified = accessibilityScanResults.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.map((n) => ({
            html: n.html,
            summary: n.failureSummary,
          })),
        }));
        console.error(`[A11Y VIOLATIONS] ${route.name} (${route.path}):\n`, JSON.stringify(simplified, null, 2));
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }

  test('DonationModal open dialog satisfies WCAG 2.2 AA accessibility standards', async ({
    page,
  }) => {
    await page.goto('/profile/campanha', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    const ofertarBtn = page.getByRole('button', { name: /ofertar/i }).first();
    await ofertarBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.error('[A11Y VIOLATIONS] DonationModal:\n', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('ContactModal open dialog satisfies WCAG 2.2 AA accessibility standards', async ({
    page,
  }) => {
    await page.goto('/profile/sobre', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    const contactBtn = page.getByRole('button', { name: /contato/i });
    await contactBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.error('[A11Y VIOLATIONS] ContactModal:\n', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
