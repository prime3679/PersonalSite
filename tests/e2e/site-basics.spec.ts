import { test, expect } from '@playwright/test';

test('rss: /rss.xml is served as XML with items', async ({ page }) => {
  const resp = await page.request.get('/rss.xml');
  expect(resp.status()).toBe(200);
  expect(resp.headers()['content-type']).toContain('xml');
  const body = await resp.text();
  expect(body).toContain('<rss');
  expect(body).toContain('<item>');
});

test('a11y: skip link jumps focus to main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab'); // first tabbable element is the skip link
  const skipLink = page.locator('a[href="#main"]');
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible(); // un-hides itself on focus
  await skipLink.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  // main carries tabindex="-1" so activation moves real focus, not just scroll.
  await expect(page.locator('main#main')).toBeFocused();
});

test('a11y: active header tab carries aria-current="page"', async ({ page }) => {
  await page.goto('/writing');
  await expect(page.locator('header nav a[href="/writing"]').first()).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('header nav a[href="/work"]').first()).not.toHaveAttribute('aria-current', 'page');
});

test('nav: header shows the home wordmark + canonical primary tabs', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  // The name acts as the home link
  await expect(page.locator('header a[href="/"]').first()).toBeVisible();
  // Primary tabs are the visible desktop nav
  for (const href of ['/work', '/lab', '/writing', '/signal-room', '/contact']) {
    await expect(page.locator(`header a[href="${href}"]`).first()).toBeVisible();
  }
  // about stays out of the primary nav but is reachable from the footer
  await expect(page.locator('header a[href="/about"]')).toHaveCount(0);
  await expect(page.locator('footer a[href="/about"]')).toBeVisible();
});
