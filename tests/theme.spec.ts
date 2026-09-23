import { test, expect } from '@playwright/test';

// dark mode follows the visitor's system setting through tokens.css. there
// is no toggle, no stored preference, and no pre-paint theme script.
test.describe('system dark mode', () => {
  for (const scheme of ['light', 'dark'] as const) {
    test(`inner pages follow a ${scheme} system scheme with paper and ink remapped together`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto('/writing/');

      const colors = await page.evaluate(() => ({
        paper: getComputedStyle(document.body).backgroundColor,
        ink: getComputedStyle(document.body).color,
        header: getComputedStyle(document.querySelector('header.site-header')!).backgroundColor,
      }));
      const expected = scheme === 'dark'
        ? { paper: 'rgb(22, 19, 14)', ink: 'rgb(234, 228, 215)' }
        : { paper: 'rgb(247, 243, 234)', ink: 'rgb(28, 24, 20)' };
      expect(colors.paper).toBe(expected.paper);
      expect(colors.ink).toBe(expected.ink);
      expect(colors.header).toBe(expected.paper);

      await expect(page.locator('[data-theme-toggle]')).toHaveCount(0);
      expect(await page.evaluate(() => {
        try { return localStorage.getItem('theme'); } catch { return null; }
      })).toBeNull();
    });
  }
});
