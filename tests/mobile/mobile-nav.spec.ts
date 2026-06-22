import { test, expect, type Locator } from '@playwright/test';

const targetWidths = [320, 375, 414];

async function expectTapTarget(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(44);
}

test.describe('mobile homepage navigation', () => {
  for (const width of targetWidths) {
    test(`mobile: ${width}px header stays compact and the menu exposes the canonical links`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const toggle = page.locator('#menu-toggle');
      const mobileNav = page.locator('#mobile-nav');
      const desktopNav = page.locator('.site-header__nav--desktop');
      const logo = page.locator('.site-header__logo');
      const hero = page.locator('.hero-title');

      await expect(toggle).toBeVisible();
      await expect(mobileNav).toBeHidden();
      await expect(desktopNav).toBeHidden();
      await expect(logo).toBeVisible();
      await expect(logo).toHaveText('adrian lumley');
      await expectTapTarget(toggle);

      const logoBox = await logo.boundingBox();
      const toggleBox = await toggle.boundingBox();
      expect(logoBox).not.toBeNull();
      expect(toggleBox).not.toBeNull();
      expect((logoBox!.x + logoBox!.width)).toBeLessThanOrEqual(toggleBox!.x - 8);

      const heroSize = await hero.evaluate((node) => parseFloat(window.getComputedStyle(node).fontSize));
      expect(heroSize).toBeLessThan(33);
      expect(heroSize).toBeGreaterThan(30);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(width);

      await toggle.click();
      await expect(mobileNav).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');

      const linkTexts = (await mobileNav.locator('a').allTextContents()).map((text) => text.trim());
      expect(linkTexts).toEqual(['work', 'lab', 'writing', 'signal room', 'contact']);

      for (const href of ['/work', '/lab', '/writing', '/signal-room', '/contact']) {
        await expectTapTarget(mobileNav.locator(`a[href="${href}"]`));
      }

      await expectTapTarget(page.locator('main a[href="/work"]'));
      await expectTapTarget(page.locator('main a[href="/lab"]'));
      await expectTapTarget(page.locator('main a[href="/signal-room"]').first());
      await expectTapTarget(page.locator('main a[href="/contact"]'));
      await expectTapTarget(page.locator('main a[href="https://www.linkedin.com/in/adrianlumley/"]'));
      await expectTapTarget(page.locator('main a[href="https://github.com/prime3679"]'));
    });
  }
});

test('mobile: Escape closes the open menu and restores focus to the toggle', async ({ page }) => {
  await page.goto('/');
  const toggle = page.locator('#menu-toggle');
  const mobileNav = page.locator('#mobile-nav');

  await toggle.click();
  await expect(mobileNav).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(mobileNav).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('mobile: tapping outside the open menu closes it', async ({ page }) => {
  await page.goto('/');
  const toggle = page.locator('#menu-toggle');
  const mobileNav = page.locator('#mobile-nav');

  await toggle.click();
  await expect(mobileNav).toBeVisible();

  await page.locator('main h1').click(); // anywhere outside the header
  await expect(mobileNav).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
