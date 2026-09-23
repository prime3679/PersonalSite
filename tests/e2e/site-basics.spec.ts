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
  await expect(page.locator('header nav a[href="/writing/"]').first()).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('header nav a[href="/about/"]').first()).not.toHaveAttribute('aria-current', 'page');
});

test('nav: header shows the home wordmark + canonical primary tabs', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/writing');
  // The name acts as the home link
  await expect(page.locator('header a[href="/"]').first()).toBeVisible();
  for (const href of ['/writing/', '/lab/', '/about/']) {
    await expect(page.locator(`header a[href="${href}"]`).first()).toBeVisible();
  }
  // signal room and contact sit one click down, out of the primary nav
  await expect(page.locator('header a[href^="/signal-room"], header a[href^="/contact"]')).toHaveCount(0);
  await expect(page.locator('footer a[href="/contact/"]')).toBeVisible();
});

test('/360/ keeps its terminal voice: mono, black on white, arrow and comment glyphs', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/360/');

  const body = page.locator('body');
  await expect(body).toHaveCSS('font-family', /SF Mono|Menlo|Monaco|monospace/);
  await expect(body).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(body).toHaveCSS('color', 'rgb(0, 0, 0)');
  await expect(page.locator('.eyebrow')).toHaveText('→ 360 feedback');
  await expect(page.locator('.note .comment')).toHaveText('// ');
  await expect(page.locator('.topbar a[href="/"]')).toHaveText('← adrianlumley.co');
  await expect(page.locator('#theme-toggle')).toHaveText('theme');
  await expect(page.locator('h2.section-title').first()).toHaveCSS('text-transform', 'uppercase');
});

test('a 404 is a page, not a null body', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist/');
  expect(response!.status()).toBe(404);
  await expect(page.locator('main h1')).toHaveText('lost the signal');
  await expect(page.locator('main a[href="/"]')).toBeVisible();
});

test('internal links carry the canonical trailing slash so no click pays a redirect', async ({ page }) => {
  for (const path of ['/', '/writing/', '/writing/the-honest-record/', '/lab/', '/about/', '/signal-room/night-shift/']) {
    await page.goto(path);
    const slashless = await page.locator('a[href^="/"]').evaluateAll((links) =>
      links
        .map((a) => a.getAttribute('href')!.split('?')[0])
        .filter((href) => !href.startsWith('/#') && href !== '/' && !/\.[a-z]+$/.test(href) && !href.endsWith('/')),
    );
    expect(slashless, `${path} links without a trailing slash`).toEqual([]);
  }
});
