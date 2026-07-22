import { test, expect, type Page } from '@playwright/test';

const canonicalLinks = ['work', 'lab', 'writing', 'signal room', 'contact'];
const canonicalHrefs = ['/work', '/lab', '/writing', '/signal-room', '/contact'];

async function expectSingleCanonicalHeader(page: Page) {
  await expect(page.locator('header.site-header')).toHaveCount(1);
  await expect(page.locator('header.site-header nav[aria-label="Primary"]')).toHaveCount(1);
  await expect(page.locator('header.site-header nav[aria-label="Mobile"]')).toHaveCount(1);
  await expect(page.locator('#theme-toggle')).toHaveCount(0);
}

async function clickBelowMobilePanel(page: Page) {
  const panelBox = await page.locator('[data-header-mobile-panel]').boundingBox();
  const viewport = page.viewportSize();
  expect(panelBox).not.toBeNull();
  expect(viewport).not.toBeNull();

  await page.mouse.click(16, Math.min(panelBox!.y + panelBox!.height + 24, viewport!.height - 24));
}

test.describe('Header Component', () => {
  for (const width of [768, 1280]) {
    test(`desktop renders one editorial header with inline mono nav and active underline at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/lab/');

      await expectSingleCanonicalHeader(page);

      const wordmark = page.getByRole('link', { name: 'adrian lumley' });
      await expect(wordmark).toHaveCSS('white-space', 'nowrap');
      await expect(wordmark).toHaveCSS('font-family', /Newsreader/);

      const desktopNav = page.locator('[data-header-desktop-nav]');
      await expect(desktopNav).toBeVisible();
      await expect(page.locator('[data-header-menu-toggle]')).toBeHidden();

      const links = desktopNav.getByRole('link');
      await expect(links).toHaveText(canonicalLinks);
      await expect(links.first()).toHaveCSS('font-family', /Geist Mono/);
      expect(await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')))).toEqual(canonicalHrefs);

      const active = desktopNav.getByRole('link', { name: 'lab' });
      await expect(active).toHaveAttribute('aria-current', 'page');
      await expect(active).toHaveCSS('text-decoration-line', /underline/);
    });
  }

  test('legacy routes stay alive while staying out of the primary nav', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const primaryNav = page.locator('[data-header-desktop-nav]');
    await expect(primaryNav.locator('a[href="/about"]')).toHaveCount(0);
    await expect(primaryNav.locator('a[href="/blog"]')).toHaveCount(0);

    await page.goto('/about');
    await expect(page.locator('main h1')).toContainText('about');

    await page.goto('/blog');
    await expect(page.locator('main')).toContainText('writing');
  });

  for (const width of [320, 375, 414]) {
    test(`mobile header stays one row and menu works at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/contact/');

      await expectSingleCanonicalHeader(page);

      const wordmark = page.getByRole('link', { name: 'adrian lumley' });
      await expect(wordmark).toHaveCSS('white-space', 'nowrap');
      await expect(wordmark.boundingBox()).resolves.toMatchObject({ height: expect.any(Number) });

      const desktopNav = page.locator('[data-header-desktop-nav]');
      const toggle = page.locator('[data-header-menu-toggle]');
      const mobilePanel = page.locator('[data-header-mobile-panel]');

      await expect(desktopNav).toBeHidden();
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(mobilePanel).toBeHidden();

      const barBox = await page.locator('[data-header-bar]').boundingBox();
      const wordmarkBox = await wordmark.boundingBox();
      const toggleBox = await toggle.boundingBox();
      expect(barBox && wordmarkBox && toggleBox).toBeTruthy();
      expect(wordmarkBox!.y).toBeLessThan(barBox!.y + barBox!.height);
      expect(toggleBox!.y).toBeLessThan(barBox!.y + barBox!.height);

      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(mobilePanel).toBeVisible();
      await expect(mobilePanel.getByRole('link')).toHaveText(canonicalLinks);
      await expect(mobilePanel.getByRole('link', { name: 'contact' })).toHaveCSS('color', /rgb/);

      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(mobilePanel).toBeHidden();

      await toggle.click();
      await expect(mobilePanel).toBeVisible();
      await clickBelowMobilePanel(page);
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(mobilePanel).toBeHidden();

      await toggle.click();
      await mobilePanel.getByRole('link', { name: 'work' }).click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
  }
});
