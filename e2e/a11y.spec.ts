import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * next-themes is configured `defaultTheme="light"` with `attribute="class"`, so it
 * ignores the OS preference by default — `emulateMedia` would not switch the app.
 * Seeding its storage key before navigation is what actually selects the scheme.
 */
const COLOR_SCHEMES = ['light', 'dark'] as const;

/**
 * Opens a dialog, retrying the click until it actually opens.
 *
 * The trigger is present in the server-rendered HTML before React attaches its
 * handler, so a single click can land on a not-yet-hydrated control and be lost.
 */
async function openDialog(page: Page, trigger: Locator) {
  await trigger.waitFor({ state: 'visible' });
  const dialog = page.getByRole('dialog');
  await expect(async () => {
    await trigger.click();
    await expect(dialog).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 20000 });
}

/**
 * Freezes CSS transitions and animations so contrast is measured at rest.
 *
 * Mid-flight, `getComputedStyle` returns interpolated colors — a scan that lands
 * during a dialog's entrance reported 4.44:1 on a control that sits at 5.18:1 once
 * settled. Waiting on `getAnimations()` is not enough on its own, because it can
 * resolve in the gap before the transition starts.
 */
async function settleForScan(page: Page) {
  await page.addStyleTag({
    content: `*, *::before, *::after {
      transition: none !important;
      animation: none !important;
    }`,
  });
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== 'running')
  );
}

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

  for (const scheme of COLOR_SCHEMES) {
    for (const route of publicRoutes) {
      test(`route ${route.name} (${route.path}) satisfies WCAG 2.2 AA accessibility standards in ${scheme} mode`, async ({
        page,
      }) => {
        await page.addInitScript(`localStorage.setItem('theme', '${scheme}')`);
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
          console.error(
            `[A11Y VIOLATIONS] ${route.name} (${route.path}) [${scheme}]:\n`,
            JSON.stringify(simplified, null, 2)
          );
        }

        expect(accessibilityScanResults.violations).toEqual([]);
      });
    }
  }

  test('DonationModal open dialog satisfies WCAG 2.2 AA accessibility standards', async ({
    page,
  }) => {
    await page.goto('/profile/campanha', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    await openDialog(page, page.getByRole('button', { name: /ofertar/i }).first());
    await settleForScan(page);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.error(
        '[A11Y VIOLATIONS] DonationModal:\n',
        JSON.stringify(accessibilityScanResults.violations, null, 2)
      );
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('ContactModal open dialog satisfies WCAG 2.2 AA accessibility standards', async ({
    page,
  }) => {
    await page.goto('/profile/sobre', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    await openDialog(page, page.getByRole('button', { name: /contato/i }));
    await settleForScan(page);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.error(
        '[A11Y VIOLATIONS] ContactModal:\n',
        JSON.stringify(accessibilityScanResults.violations, null, 2)
      );
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
