import { test, expect } from '@playwright/test';

test.describe('broadsheet column alignment', () => {
  test('wordmark and footer content left-align with the opening kicker at 1280x800', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const openingBox = await page.locator('.home-kicker').boundingBox();
    const wordmarkBox = await page.locator('.site-header__logo').boundingBox();
    const footerFirstBox = await page.locator('footer .site-footer-inner > *').first().boundingBox();

    expect(openingBox).not.toBeNull();
    expect(wordmarkBox).not.toBeNull();
    expect(footerFirstBox).not.toBeNull();

    expect(Math.abs(wordmarkBox!.x - openingBox!.x)).toBeLessThan(2);
    expect(Math.abs(footerFirstBox!.x - openingBox!.x)).toBeLessThan(2);
  });

  test('no horizontal scroll at 320x800', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(320);
  });
});
