import { test, expect, type Page } from '@playwright/test';

const canonicalLinks = ['writing', 'lab', 'about'];
const canonicalHrefs = ['/writing/', '/lab/', '/about/'];

async function expectSingleCanonicalHeader(page: Page) {
  await expect(page.locator('header.site-header')).toHaveCount(1);
  await expect(page.locator('header.site-header nav[aria-label="Primary"]')).toHaveCount(1);
  // three items fit on one line at every width: no menu, no theme toggle
  await expect(page.locator('#menu-toggle, #mobile-nav, [data-theme-toggle]')).toHaveCount(0);
}

test.describe('Header Component', () => {
  test('the homepage is the record and carries no header at all', async ({ page }) => {
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await expect(page.locator('header.site-header')).toHaveCount(0);
    }
  });

  for (const width of [320, 375, 414, 768, 1280]) {
    test(`one record header on one row: sans wordmark, sans nav, current-page rule at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/lab/');

      await expectSingleCanonicalHeader(page);

      // the header is set in the record's own type: the body sans at body
      // size and weight, no serif wordmark, no mono nav, no hover shift
      const bodyFont = await page.locator('body').evaluate((node) => {
        const style = window.getComputedStyle(node);
        return { family: style.fontFamily, size: style.fontSize, weight: style.fontWeight };
      });
      const wordmark = page.getByRole('link', { name: 'adrian lumley' });
      await expect(wordmark).toHaveCSS('white-space', 'nowrap');
      await expect(wordmark).toHaveCSS('font-family', bodyFont.family);
      await expect(wordmark).toHaveCSS('font-size', bodyFont.size);
      await expect(wordmark).toHaveCSS('font-weight', bodyFont.weight);
      await expect(wordmark).toHaveCSS('text-decoration-line', 'none');

      const nav = page.locator('header.site-header nav');
      const links = nav.getByRole('link');
      await expect(nav).toBeVisible();
      await expect(links).toHaveText(canonicalLinks);
      await expect(links.first()).toHaveCSS('font-family', bodyFont.family);
      await expect(links.first()).toHaveCSS('font-size', bodyFont.size);
      expect(await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')))).toEqual(canonicalHrefs);

      const active = nav.getByRole('link', { name: 'lab' });
      await expect(active).toHaveAttribute('aria-current', 'page');
      await expect(active).toHaveCSS('text-decoration-thickness', '2px');
      await expect(nav.getByRole('link', { name: 'about' })).toHaveCSS('text-decoration-thickness', '1px');

      // wordmark and every nav link share one row and stay on screen
      const wordmarkBox = (await wordmark.boundingBox())!;
      for (const box of await links.evaluateAll((nodes) => nodes.map((node) => {
        const r = node.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, right: r.right };
      }))) {
        expect(box.top).toBeLessThan(wordmarkBox.y + wordmarkBox.height);
        expect(box.bottom).toBeGreaterThan(wordmarkBox.y);
        expect(box.right).toBeLessThanOrEqual(width);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }

  test('retired routes redirect instead of 404ing', async ({ page }) => {
    await page.goto('/work/');
    await page.waitForURL(/\/about\/#work$/);
    await expect(page.locator('main h1')).toContainText('about');

    await page.goto('/services/');
    await page.waitForURL(/\/about\/$/);

    await page.goto('/blog');
    await page.waitForURL(/\/writing\/$/);
  });
});
