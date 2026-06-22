import { test, expect } from '@playwright/test';

test.describe('Header Component', () => {
  test('desktop nav keeps the canonical inline links', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const toggle = page.locator('#menu-toggle');
    const desktopNav = page.locator('.site-header__nav--desktop');
    const mobileNav = page.locator('#mobile-nav');

    await expect(toggle).toBeHidden();
    await expect(desktopNav).toBeVisible();
    await expect(mobileNav).toBeHidden();

    const links = desktopNav.locator('a');
    await expect(links).toHaveCount(5);
    await expect(links).toHaveText(['work', 'lab', 'writing', 'signal room', 'contact']);

    const hrefs = await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
    expect(hrefs).toEqual(['/work', '/lab', '/writing', '/signal-room', '/contact']);
  });

  test('legacy routes stay alive while staying out of the primary nav', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    const primaryNav = page.locator('.site-header__nav--desktop');
    await expect(primaryNav.locator('a[href="/about"]')).toHaveCount(0);
    await expect(primaryNav.locator('a[href="/blog"]')).toHaveCount(0);

    await page.goto('/about');
    await expect(page.locator('main h1')).toContainText('about');

    await page.goto('/blog');
    await expect(page.locator('main')).toContainText('writing');
  });
});
