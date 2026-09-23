import { test, expect, type Locator } from '@playwright/test';

const targetWidths = [320, 375, 390, 414];
const subpixelTolerance = 0.01;

async function expectTapTarget(locator: Locator, minimumHeight = 44) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height + subpixelTolerance).toBeGreaterThanOrEqual(minimumHeight);
}

// the homepage is the record and ships no header, so the header checks run
// on an inner page; the record gets its own tap-target pass.
const NAV_PAGE = '/writing/';

test.describe('mobile homepage record', () => {
  for (const width of targetWidths) {
    test(`mobile: ${width}px homepage is the record with no chrome and no horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      await expect(page.locator('header.site-header, footer')).toHaveCount(0);
      await expect(page.locator('main h1')).toBeVisible();

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(width);

      // every record link stays tappable at 44px without inflating the rows
      const recordLinks = page.locator('main .record a');
      const recordLinkCount = await recordLinks.count();
      expect(recordLinkCount).toBeGreaterThan(5);
      for (let i = 0; i < recordLinkCount; i += 1) {
        await expectTapTarget(recordLinks.nth(i));
      }
      await expectTapTarget(page.locator('main a[href="/writing/the-honest-record/"]'));
      await expectTapTarget(page.locator('main a[href="/about/"]'));
      await expectTapTarget(page.locator('main a[href="/contact/"]'));
      await expectTapTarget(page.locator('main a[href="https://www.linkedin.com/in/adrianlumley/"]'));
      await expectTapTarget(page.locator('main a[href="https://github.com/prime3679"]'));
    });
  }
});

test.describe('mobile navigation', () => {
  for (const width of targetWidths) {
    test(`mobile: ${width}px header keeps the wordmark and all three links on one row`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(NAV_PAGE);

      await expect(page.locator('#menu-toggle, #mobile-nav')).toHaveCount(0);

      const logo = page.locator('.site-header__wordmark');
      await expect(logo).toHaveText('adrian lumley');
      await expect(logo).toHaveCSS('white-space', 'nowrap');
      const logoBox = (await logo.boundingBox())!;
      // one line tall: the wordmark's glyphs never wrap (the link box itself
      // is padded out to a 44px tap target)
      const lines = await logo.evaluate((node) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        return range.getClientRects().length;
      });
      expect(lines).toBe(1);
      await expectTapTarget(logo);

      const links = page.locator('header.site-header nav a');
      expect((await links.allTextContents()).map((text) => text.trim())).toEqual(['writing', 'lab', 'about']);
      for (const href of ['/writing/', '/lab/', '/about/']) {
        const link = page.locator(`header.site-header nav a[href="${href}"]`);
        await expect(link).toBeVisible();
        await expectTapTarget(link);
        const box = (await link.boundingBox())!;
        expect(box.x).toBeGreaterThan(logoBox.x + logoBox.width);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }

      await expect(page.locator('main h1')).toBeVisible();
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(width);
    });
  }
});
