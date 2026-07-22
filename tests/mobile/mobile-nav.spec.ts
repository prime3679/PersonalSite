import { test, expect, type Locator, type Page } from '@playwright/test';

const targetWidths = [320, 375, 390, 414];
const layoutTransitionProperties = new Set(['max-height', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'width', 'height', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left']);

async function expectTapTarget(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(45);
}

async function clickBelowMobilePanel(page: Page) {
  const panelBox = await page.locator('#mobile-nav').boundingBox();
  const viewport = page.viewportSize();
  expect(panelBox).not.toBeNull();
  expect(viewport).not.toBeNull();

  await page.mouse.click(16, Math.min(panelBox!.y + panelBox!.height + 24, viewport!.height - 24));
}

test.describe('mobile homepage navigation', () => {
  for (const width of targetWidths) {
    test(`mobile: ${width}px header stays compact and the menu exposes the canonical links`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const toggle = page.locator('#menu-toggle');
      const mobileNav = page.locator('#mobile-nav');
      const desktopNav = page.locator('[data-header-desktop-nav]');
      const logo = page.locator('.site-header__logo');
      const opening = page.locator('.home-kicker');

      await expect(toggle).toBeVisible();
      await expect(mobileNav).toBeHidden();
      await expect(mobileNav).toHaveAttribute('inert', '');
      await expect(desktopNav).toBeHidden();
      await expect(logo).toBeVisible();
      await expect(logo).toHaveText('adrian lumley');
      await expectTapTarget(toggle);

      const closedTransitionProperties = await mobileNav.evaluate((node) =>
        window.getComputedStyle(node).transitionProperty.split(',').map((property) => property.trim())
      );
      expect(closedTransitionProperties).not.toContain('all');
      for (const property of closedTransitionProperties) {
        expect(layoutTransitionProperties.has(property)).toBe(false);
      }

      const logoBox = await logo.boundingBox();
      const toggleBox = await toggle.boundingBox();
      expect(logoBox).not.toBeNull();
      expect(toggleBox).not.toBeNull();
      expect((logoBox!.x + logoBox!.width)).toBeLessThanOrEqual(toggleBox!.x - 8);

      await expect(opening).toBeVisible();

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(width);

      await toggle.click();
      await expect(mobileNav).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(mobileNav).not.toHaveAttribute('inert', '');

      const openTransitionProperties = await mobileNav.evaluate((node) =>
        window.getComputedStyle(node).transitionProperty.split(',').map((property) => property.trim())
      );
      expect(openTransitionProperties).not.toContain('all');
      for (const property of openTransitionProperties) {
        expect(layoutTransitionProperties.has(property)).toBe(false);
      }

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

test('mobile: reduced motion removes the reveal transition without exposing hidden links', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/');

  const toggle = page.locator('#menu-toggle');
  const mobileNav = page.locator('#mobile-nav');

  await expect(mobileNav).toBeHidden();
  await expect(mobileNav).toHaveAttribute('inert', '');
  await expect(mobileNav).toHaveCSS('transition-property', 'none');

  await toggle.click();
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav).not.toHaveAttribute('inert', '');
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

  await clickBelowMobilePanel(page);
  await expect(mobileNav).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
