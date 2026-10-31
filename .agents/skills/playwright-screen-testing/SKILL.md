---
name: playwright-screen-testing
description: >-
  Playwright screen and UI component verification skill. Use when writing, running,
  or debugging Playwright tests to inspect built screens, take full-page and element
  screenshots, verify responsive layouts across viewports (mobile, tablet, desktop),
  validate accessibility, and test interactive UI flows.
---

# Playwright Screen & UI Testing Runbook

This skill provides step-by-step guidance and best practices for testing newly built screens, pages, and interactive UI components using Playwright.

---

## 1. Core Principles for Screen Testing

1. **Multi-Viewport Verification**:
   Every new screen must be verified across standard screen sizes:
   - **Mobile**: `375 x 667` (iPhone SE) or `390 x 844` (iPhone 14 / Pixel 7)
   - **Tablet**: `768 x 1024` (iPad Mini / Portrait)
   - **Desktop**: `1280 x 800` (MacBook / Standard Laptop) and `1920 x 1080` (FHD Desktop)

2. **Visual Inspection via Screenshots**:
   - Capture full-page or localized component screenshots during tests to inspect rendering artifacts, clipping, and responsive behavior.
   - Store screenshots in a predictable artifacts directory (e.g. `playwright-report/screenshots/` or `tests/screenshots/`).

3. **Accessible Selector Hierarchy**:
   Prefer user-facing locators in order:
   - `page.getByRole('heading', { name: ... })`
   - `page.getByRole('button', { name: ... })`
   - `page.getByLabel(...)`
   - `page.getByText(...)`
   - `page.getByPlaceholder(...)`
   - Avoid brittle CSS class selectors or DOM paths.

---

## 2. Standard Screen Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Screen: Dashboard / Main Screen', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to page under test
    await page.goto('/');
    // Wait for hydration or main content to load
    await page.waitForLoadState('networkidle');
  });

  test('renders desktop screen structure correctly', async ({ page }) => {
    // Ensure viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    // Verify key landmark elements
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Capture visual screenshot
    await page.screenshot({ path: 'test-results/desktop-screen.png', fullPage: true });
  });

  test('renders responsive mobile screen without horizontal overflow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // Verify hamburger menu or bottom navigation
    const mobileNav = page.getByRole('button', { name: /menu|abrir navegação/i });
    if (await mobileNav.isVisible()) {
      await mobileNav.click();
      await expect(page.getByRole('dialog')).toBeVisible();
    }

    // Verify horizontal scroll width does not exceed viewport
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    // Capture mobile visual screenshot
    await page.screenshot({ path: 'test-results/mobile-screen.png', fullPage: true });
  });

  test('handles interactive form flows and validation states', async ({ page }) => {
    // Fill out form fields
    const nameInput = page.getByLabel(/nome/i);
    if (await nameInput.isVisible()) {
      await nameInput.fill('Teste Automatizado');
    }

    // Trigger submission or action
    const submitBtn = page.getByRole('button', { name: /salvar|enviar|confirmar/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }
  });
});
```

---

## 3. Screen Verification Commands

- **Run all screen tests**:
  ```bash
  npx playwright test
  ```
- **Run specific screen test**:
  ```bash
  npx playwright test e2e/screens/profile.spec.ts
  ```
- **Run in headed mode** (opens Chrome browser visually):
  ```bash
  npx playwright test --headed
  ```
- **Inspect test results and traces**:
  ```bash
  npx playwright show-report
  ```
- **Interactive UI Mode**:
  ```bash
  npx playwright test --ui
  ```

---

## 4. Troubleshooting Common Issues

1. **Hydration Mismatch / Element Not Ready**:
   - Use `await expect(page.getByRole(...)).toBeVisible()` which auto-retries.
   - Avoid `page.waitForTimeout()` — instead wait for a specific element or network event (`await page.waitForResponse(...)`).
2. **Horizontal Overflow / Sticky Navbar Cutoff**:
   - Verify `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
   - Check elements with fixed widths or negative margins.
3. **Modal or Overlay Blocking Clicks**:
   - Wait for animations: `await page.locator('.modal').waitFor({ state: 'visible' })`.
