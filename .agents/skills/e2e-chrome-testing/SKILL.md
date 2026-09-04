---
name: e2e-chrome-testing
description: >-
  Playwright and Google Chrome End-to-End (E2E) testing runbook. Use when writing,
  running, or debugging end-to-end tests, cross-browser scenarios, mobile viewport
  emulation (Chromium/Chrome), visual regressions, and network mocking.
---

# End-to-End (E2E) & Google Chrome Testing Guidelines

This skill provides patterns for Playwright test automation, Chrome browser emulation, and responsive visual testing.

## 1. Playwright Setup & Configuration

- Configuration file: `playwright.config.ts`
- Test directory: `e2e/`
- Browser Engines: Chromium (Google Chrome), Firefox, WebKit (Safari), Mobile Chrome (Pixel 7 / iPhone).

## 2. Standard E2E Test Pattern

```typescript
import { test, expect } from '@playwright/test';

test.describe('Visitor Profile & Impact Project Flow', () => {
  test('navigates to public profile, plays video, and views photo carousel', async ({ page }) => {
    await page.goto('/user/_SamiMendonca');

    // Verify H1 Heading
    await expect(page.locator('h1')).toContainText('Samuel Mendonça');

    // Verify Tab navigation
    const impactTab = page.getByRole('button', { name: /projetos de impacto/i });
    if (await impactTab.isVisible()) {
      await impactTab.click();
    }

    // Verify Impact Project card
    await expect(page.getByRole('heading', { name: /projeto social/i })).toBeVisible();

    // Verify Ofertar modal trigger
    await page
      .getByRole('button', { name: /ofertar/i })
      .first()
      .click();
    await expect(page.getByRole('heading', { name: /ofertar na missão/i })).toBeVisible();
  });
});
```

## 3. Responsive Multi-Viewport Testing

Always verify critical user journeys across target screen sizes:

1. **Mobile (Viewport: 375 x 667 / 390 x 844)**:
   - Ensure bottom navigation is visible.
   - Verify hamburger / mobile drawers reflow cleanly without horizontal scrollbars.
2. **Desktop (Viewport: 1280 x 800)**:
   - Verify full sticky PageNavbar and desktop actions.

## 4. Running Playwright & Headless Chrome Commands

- Run all E2E tests: `pnpm exec playwright test`
- Run specific spec: `pnpm exec playwright test e2e/visitor-profile.spec.ts`
- Run in UI / Heaeded mode: `pnpm exec playwright test --headed`
- Generate HTML report: `pnpm exec playwright show-report`
