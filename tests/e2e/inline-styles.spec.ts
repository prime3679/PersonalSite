import { test, expect } from '@playwright/test';

const representativePages = ['/', '/work/', '/writing/'];

test.describe('production HTML inlines Astro stylesheets', () => {
  for (const path of representativePages) {
    test(`${path} ships inline CSS without external stylesheet dependencies`, async ({ page }) => {
      await page.goto(path);

      await expect(page.locator('head link[rel="stylesheet"]')).toHaveCount(0);

      const inlineCss = await page.locator('head style').evaluateAll((styles) =>
        styles.map((style) => style.textContent ?? '').join('\n'),
      );

      expect(inlineCss.length).toBeGreaterThan(1000);
      expect(inlineCss).toContain('--paper');
      expect(inlineCss).toContain('.site-header');
    });
  }
});
