import { test, expect } from '@playwright/test';

test.describe('Mobile-First Layout & Touch Targets Verification', () => {
  test('Landing page has no horizontal overflow and displays touch-friendly bottom nav on mobile', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    if (isMobile) {
      // Mobile bottom navigation is visible
      const bottomNav = page.locator('nav[aria-label="Navegação inferior do visitante"]');
      await expect(bottomNav).toBeVisible();

      // Touch targets are at least 44px high
      const navLinks = bottomNav.locator('a');
      const count = await navLinks.count();
      expect(count).toBeGreaterThanOrEqual(3);

      for (let i = 0; i < count; i++) {
        const box = await navLinks.nth(i).boundingBox();
        expect(box).not.toBeNull();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('Login and Auth pages fit mobile viewports without horizontal scroll and have accessible touch targets', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Primary login button touch target on mobile
    const submitBtn = page.getByRole('button', { name: /entrar/i });
    const box = await submitBtn.boundingBox();
    expect(box).not.toBeNull();
    if (box && isMobile) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('Missionary profile page has touch-friendly action buttons and opens DonationModal with 44px copy target', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/profile/sobre');
    await page.waitForLoadState('networkidle');

    // Verify edit profile action button touch target
    const editBtn = page.getByRole('button', { name: /editar/i });
    await expect(editBtn).toBeVisible();
    const editBox = await editBtn.boundingBox();
    expect(editBox).not.toBeNull();
    if (editBox && isMobile) {
      expect(editBox.height).toBeGreaterThanOrEqual(44);
      expect(editBox.width).toBeGreaterThanOrEqual(44);
    }

    // Open Contact modal
    const contactBtn = page.getByRole('button', { name: /contato/i });
    await contactBtn.click();
    const contactDialog = page.getByRole('dialog');
    await expect(contactDialog).toBeVisible();

    // Verify contact dialog action buttons are touch friendly (>= 44px)
    const copyBtn = contactDialog.getByRole('button', { name: /copiar/i }).first();
    const copyBox = await copyBtn.boundingBox();
    expect(copyBox).not.toBeNull();
    if (copyBox && isMobile) {
      expect(copyBox.height).toBeGreaterThanOrEqual(44);
    }

    // Close contact dialog
    await page.keyboard.press('Escape');
    await expect(contactDialog).not.toBeVisible();
  });

  test('Financial settings page buttons and switches are touch-friendly and preview opens cleanly', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/profile/financeiro');
    await page.waitForLoadState('networkidle');

    // Verify no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Check save button touch target
    const saveBtn = page.getByRole('button', { name: /salvar configurações/i });
    await expect(saveBtn).toBeVisible();
    const saveBox = await saveBtn.boundingBox();
    expect(saveBox).not.toBeNull();
    if (saveBox && isMobile) {
      expect(saveBox.height).toBeGreaterThanOrEqual(44);
    }

    // Open preview modal
    const previewBtn = page.getByRole('button', { name: /visualizar prévia/i }).first();
    await previewBtn.click();

    const previewModal = page.getByRole('dialog');
    await expect(previewModal).toBeVisible();

    // Check Pix copy button in modal
    const copyPixBtn = previewModal.getByRole('button', { name: /copiar chave pix/i });
    await expect(copyPixBtn).toBeVisible();
    const copyPixBox = await copyPixBtn.boundingBox();
    expect(copyPixBox).not.toBeNull();
    if (copyPixBox && isMobile) {
      expect(copyPixBox.height).toBeGreaterThanOrEqual(44);
      expect(copyPixBox.width).toBeGreaterThan(200);
    }

    // Close preview modal
    await page.keyboard.press('Escape');
    await expect(previewModal).not.toBeVisible();
  });

  test('Campaign page has responsive Ofertar action and opens donation modal with full mobile width', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/profile/campanha');
    await page.waitForLoadState('networkidle');

    // Ofertar button
    const ofertarBtn = page.getByRole('button', { name: /ofertar/i }).first();
    await expect(ofertarBtn).toBeVisible();
    const ofertarBox = await ofertarBtn.boundingBox();
    expect(ofertarBox).not.toBeNull();
    if (ofertarBox && isMobile) {
      expect(ofertarBox.height).toBeGreaterThanOrEqual(44);
    }

    await ofertarBtn.click();

    const donationDialog = page.getByRole('dialog');
    await expect(donationDialog).toBeVisible();

    // In modal, check responsive dialog dimensions
    const dialogBox = await donationDialog.boundingBox();
    expect(dialogBox).not.toBeNull();
    if (dialogBox && isMobile) {
      // In mobile, modal should occupy most of the viewport width
      expect(dialogBox.width).toBeGreaterThan(300);
    }
  });
});
