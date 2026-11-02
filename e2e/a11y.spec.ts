import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockMissionarySession } from './support/session';

/**
 * next-themes is configured `defaultTheme="light"` with `attribute="class"`, so it
 * ignores the OS preference by default — `emulateMedia` would not switch the app.
 * Seeding its storage key before navigation is what actually selects the scheme.
 */
const COLOR_SCHEMES = ['light', 'dark'] as const;
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function expectNoViolations(page: Page, label: string, include?: string) {
  let builder = new AxeBuilder({ page }).exclude('iframe').withTags(WCAG_TAGS);
  if (include) builder = builder.include(include);
  const results = await builder.analyze();
  if (results.violations.length > 0) {
    console.error(
      `[A11Y VIOLATIONS] ${label}:\n`,
      JSON.stringify(
        results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({ html: n.html, summary: n.failureSummary })),
        })),
        null,
        2
      )
    );
  }
  expect(results.violations).toEqual([]);
}

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
    { name: 'Missionary Profile (Edit header)', path: '/profile/edit-profile' },
    { name: 'Missionary Profile (Edit Sobre)', path: '/profile/sobre/edit' },
    { name: 'Missionary Profile (Campanha)', path: '/profile/campanha' },
    { name: 'Missionary Profile (Projetos de Impacto)', path: '/profile/projetos-de-impacto' },
    { name: 'Missionary Profile (Financial Settings)', path: '/profile/financeiro' },
    { name: 'Account Settings (Sessões ativas)', path: '/profile/configuracoes' },
    { name: 'Supporter Profile (Following)', path: '/profile/supporter/missionarios' },
    { name: 'Supporter Profile (Saved Posts)', path: '/profile/supporter/postagens-salvas' },
  ];

  // Owner pages need a session since src/proxy.ts; the BFF is mocked with fixtures.
  test.beforeEach(async ({ page }) => {
    await mockMissionarySession(page);
  });

  for (const scheme of COLOR_SCHEMES) {
    for (const route of publicRoutes) {
      test(`route ${route.name} (${route.path}) satisfies WCAG 2.2 AA accessibility standards in ${scheme} mode`, async ({
        page,
      }) => {
        await page.addInitScript(`localStorage.setItem('theme', '${scheme}')`);
        await page.goto(route.path, { waitUntil: 'domcontentloaded' });
        // next-themes applies `.dark` from storage; wait so axe does not scan the wrong scheme.
        await page.waitForFunction(
          (expected) => {
            const isDark = document.documentElement.classList.contains('dark');
            return expected === 'dark' ? isDark : !isDark;
          },
          scheme,
          { timeout: 10000 }
        );
        await settleForScan(page);

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

  test('accessibility preferences dialog satisfies WCAG 2.2 AA', async ({ page }) => {
    await page.goto('/profile/sobre', { waitUntil: 'domcontentloaded' });
    await openDialog(
      page,
      page.getByRole('button', { name: /preferências de acessibilidade/i }).first()
    );
    await settleForScan(page);

    await expectNoViolations(page, 'AccessibilityPreferences', '[role="dialog"]');
  });

  for (const scheme of COLOR_SCHEMES) {
    test(`high contrast + larger text keep the profile accessible in ${scheme} mode`, async ({
      page,
    }) => {
      await page.addInitScript(
        ({ theme }) => {
          localStorage.setItem('theme', theme);
          localStorage.setItem(
            'missionapp_a11y_preferences_v1',
            JSON.stringify({
              state: { fontScale: 130, highContrast: true, underlineLinks: true },
              version: 1,
            })
          );
        },
        { theme: scheme }
      );
      await page.goto('/profile/sobre', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('html')).toHaveAttribute('data-a11y-contrast', 'high');
      await expect(page.locator('html')).toHaveAttribute('data-a11y-font-scale', '130');
      await page.getByRole('heading', { name: 'Sobre', exact: true }).waitFor();
      await settleForScan(page);

      // Larger text must not create horizontal scroll (WCAG 1.4.10 reflow).
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(overflows).toBe(false);
      await expectNoViolations(page, `High contrast profile [${scheme}]`);
    });
  }
});

test.describe('Keyboard and motion', () => {
  test.beforeEach(async ({ page }) => {
    await mockMissionarySession(page);
  });

  test('the skip link is the first tab stop and moves focus to main content', async ({ page }) => {
    await page.goto('/profile/sobre');
    await page.getByRole('heading', { name: 'Sobre', exact: true }).waitFor();

    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: /pular para o conteúdo principal/i });
    await expect(skip).toBeFocused();
    await expect(page.getByRole('link', { name: /pular para o conteúdo principal/i })).toHaveCount(
      1
    );

    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('Escape closes the preferences dialog and returns focus to its trigger', async ({
    page,
  }) => {
    await page.goto('/profile/sobre');
    const trigger = page.getByRole('button', { name: /preferências de acessibilidade/i }).first();
    await openDialog(page, trigger);

    await page.keyboard.press('Escape');

    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('the Sobre edit form shows errors next to the fields and focuses the first one', async ({
    page,
  }) => {
    await page.goto('/profile/sobre/edit');
    const city = page.getByLabel(/^cidade$/i);
    await city.fill('');
    await page.getByRole('button', { name: /^salvar$/i }).click();

    await expect(city).toHaveAttribute('aria-invalid', 'true');
    await expect(city).toBeFocused();
    await expect(page.getByText(/preencha para salvar o local de atuação/i)).toBeVisible();
  });

  test('reduce motion stops the campaign carousel from advancing on its own', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/profile/campanha');
    const zoom = page.getByRole('button', { name: /ampliar imagem 1 de/i });
    await zoom.waitFor();

    await page.waitForTimeout(6000);

    await expect(page.getByRole('button', { name: /ampliar imagem 1 de/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /pausar troca automática/i })).toHaveCount(0);
  });
});
