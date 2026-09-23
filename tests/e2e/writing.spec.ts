import { test, expect } from '@playwright/test';

test('writing: the index is the record table, newest first, with a dek and tags under each title', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/writing');

  const rows = page.locator('#post-list .row');
  await expect(rows).toHaveCount(4);

  const first = rows.first();
  await expect(first.locator('time')).toHaveText('July 2026');
  await expect(first.getByRole('link', { name: 'The honest record' })).toHaveAttribute('href', '/writing/the-honest-record/');
  await expect(first.locator('p').first()).toHaveText('People lie in journals. They perform in therapy. Nobody performs for a coding agent.');
  await expect(first.locator('a[href="/writing/?tag=writing"]')).toHaveText('writing');

  // the key column hugs its widest date; every title starts at the same x
  const titleXs = await page.locator('#post-list .row h2').evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().x));
  expect(new Set(titleXs.map((x) => Math.round(x))).size).toBe(1);

  // no reading times; the filter and the rss line are present
  await expect(page.locator('main')).not.toContainText('min read');
  await expect(page.locator('#tag-filters button.chip')).toHaveCount(7);
  await expect(page.locator('main a[href="/rss.xml"]')).toBeVisible();
});

test('writing: tag chip filters posts and syncs the URL', async ({ page }) => {
  await page.goto('/writing');

  const productPost = page.locator('.blog-post:has(a[href="/writing/second-order-effects/"])');
  const aiOnlyPost = page.locator('.blog-post:has(a[href="/writing/claude-gmail-connector-data/"])');

  await expect(productPost).toBeVisible();
  await expect(aiOnlyPost).toBeVisible();

  await page.locator('button.chip[data-tag="systems"]').click();

  await expect(productPost).toBeVisible(); // second-order-effects is tagged systems
  await expect(aiOnlyPost).toHaveClass(/hidden/); // claude-gmail is ai only
  await expect(aiOnlyPost).toBeHidden();
  await expect(page).toHaveURL(/\?tag=systems/);
  await expect(page.locator('button.chip[data-tag="systems"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('button.chip[data-tag="all"]')).toHaveAttribute('aria-pressed', 'false');

  await page.locator('button.chip[data-tag="all"]').click();
  await expect(aiOnlyPost).toBeVisible();
  await expect(page).not.toHaveURL(/\?tag=/);
});

test('writing: ?tag= deep link applies the filter on load', async ({ page }) => {
  await page.goto('/writing/?tag=systems');

  await expect(page.locator('.blog-post:has(a[href="/writing/second-order-effects/"])')).toBeVisible();
  await expect(page.locator('.blog-post:has(a[href="/writing/meeting-cost/"])')).toHaveClass(/hidden/);
  await expect(page.locator('button.chip[data-tag="systems"]')).toHaveAttribute('aria-pressed', 'true');
});

test('writing: a per-post tag link is a deep link into the filter', async ({ page }) => {
  await page.goto('/writing');
  await page.locator('.blog-post:has(a[href="/writing/meeting-cost/"]) a[href="/writing/?tag=cost"]').click();
  await expect(page).toHaveURL(/\/writing\/\?tag=cost$/);
  await expect(page.locator('button.chip[data-tag="cost"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.blog-post:has(a[href="/writing/the-honest-record/"])')).toHaveClass(/hidden/);
});

test('writing: the index lists exactly the published posts', async ({ page }) => {
  await page.goto('/writing');
  await expect(page.locator('#post-list .blog-post')).toHaveCount(4);
});

test('writing: an essay reads in the serif with a date line, inside record chrome', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/writing/the-honest-record/');

  const title = page.locator('main h1');
  await expect(title).toHaveText('The honest record');
  await expect(title).toHaveCSS('font-family', /Newsreader/);
  await expect(page.locator('.page-standfirst')).toHaveText('July 8, 2026');
  await expect(page.locator('main')).not.toContainText('min read');
  await expect(page.locator('main')).not.toContainText('more on');

  const prose = page.locator('.prose p').first();
  await expect(prose).toHaveCSS('font-family', /Newsreader/);
  expect(await prose.evaluate((n) => Number.parseFloat(window.getComputedStyle(n).fontSize))).toBeCloseTo(19, 0);

  // the serif face is preloaded on this page and nowhere in the chrome
  await expect(page.locator('head link[rel="preload"][href*="newsreader"]')).toHaveCount(1);
  await expect(page.locator('.site-header__wordmark')).toHaveCSS('font-family', /Geist/);
  await expect(page.locator('main footer dt').first()).toHaveCSS('font-family', /Geist/);

  // pages that are not long-form neither preload nor use the serif
  await page.goto('/about/');
  await expect(page.locator('head link[rel="preload"][href*="newsreader"]')).toHaveCount(0);
  await expect(page.locator('main h1')).toHaveCSS('font-family', /Geist/);
});

test('writing: post prev/next navigation walks the archive in date order', async ({ page }) => {
  await page.goto('/writing');
  // Newest post has no "newer" row; it links back in time only.
  const newestHref = await page.locator('#post-list h2 a').first().getAttribute('href');
  await page.goto(newestHref!);

  const postNav = page.locator('main footer nav[aria-label="post navigation"]');
  await expect(postNav).toBeVisible();
  await expect(postNav.locator('dt')).toHaveText(['older', 'index']);

  const olderHref = await postNav.locator('a').first().getAttribute('href');
  expect(olderHref).toBeTruthy();
  await page.goto(olderHref!);
  await expect(page).toHaveURL(new RegExp(`${olderHref}$`));

  // From the older post, the newer row leads back to the newest.
  const olderPostNav = page.locator('main footer nav[aria-label="post navigation"]');
  await expect(olderPostNav.locator('dt')).toHaveText(['older', 'newer', 'index']);
  await expect(olderPostNav.locator(`a[href="${newestHref}"]`)).toBeVisible();
  await expect(olderPostNav.locator('a[href="/writing/"]')).toHaveText('all writing');
});
