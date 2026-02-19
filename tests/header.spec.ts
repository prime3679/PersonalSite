import { test, expect } from '@playwright/test';

test.describe('Header Mobile Menu', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should toggle mobile menu visibility', async ({ page }) => {
    await page.goto('/');

    const menuToggle = page.locator('#menu-toggle');
    const mobileNav = page.locator('#mobile-nav');
    const openIcon = page.locator('#menu-open-icon');
    const closeIcon = page.locator('#menu-close-icon');

    // Initial state
    await expect(menuToggle).toBeVisible();
    await expect(mobileNav).toBeHidden();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(openIcon).toBeVisible();
    await expect(closeIcon).toBeHidden();

    // Click to open
    await menuToggle.click();

    // Expanded state
    await expect(mobileNav).toBeVisible();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(openIcon).toBeHidden();
    await expect(closeIcon).toBeVisible();

    // Click to close
    await menuToggle.click();

    // Collapsed state
    await expect(mobileNav).toBeHidden();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(openIcon).toBeVisible();
    await expect(closeIcon).toBeHidden();
  });
});
