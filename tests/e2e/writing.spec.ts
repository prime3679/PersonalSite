import { test, expect } from '@playwright/test';

test('writing: tag chip filters posts and syncs the URL', async ({ page }) => {
  await page.goto('/writing');

  const productPost = page.locator('article.blog-post:has(a[href="/writing/second-order-effects"])');
  const aiOnlyPost = page.locator('article.blog-post:has(a[href="/writing/claude-gmail-connector-data"])');

  await expect(productPost).toBeVisible();
  await expect(aiOnlyPost).toBeVisible();

  await page.locator('button.chip[data-tag="systems"]').click();

  await expect(productPost).toBeVisible(); // second-order-effects is tagged systems
  await expect(aiOnlyPost).toHaveClass(/hidden/); // claude-gmail is ai only
  await expect(page).toHaveURL(/\?tag=systems/);
  await expect(page.locator('button.chip[data-tag="systems"]')).toHaveAttribute('aria-pressed', 'true');
});

test('writing: ?tag= deep link applies the filter on load', async ({ page }) => {
  await page.goto('/writing?tag=building');

  await expect(page.locator('article.blog-post:has(a[href="/writing/joytap-one-sprint"])')).toBeVisible();
  await expect(page.locator('article.blog-post:has(a[href="/writing/meeting-cost"])')).toHaveClass(/hidden/);
  await expect(page.locator('button.chip[data-tag="building"]')).toHaveAttribute('aria-pressed', 'true');
});

test('writing: unpublished posts do not appear on the index', async ({ page }) => {
  await page.goto('/writing');

  // familyos-building-a-family-agent.md has published: false.
  await expect(page.getByText('I gave an AI agent two weeks to coordinate my family')).toHaveCount(0);
  // ai-cost-70-percent.md and bishop-six-weeks.md are also published: false.
  await expect(page.getByText("Here's the only thing that mattered.")).toHaveCount(0);
  await expect(page.getByText('Six weeks with an AI chief of staff.')).toHaveCount(0);
});

test('writing: reading time shows on the index and a post', async ({ page }) => {
  await page.goto('/writing');
  await expect(page.locator('article.blog-post').first()).toContainText('min read');

  await page.goto('/writing/meeting-cost');
  await expect(page.locator('main')).toContainText('min read');
});

test('writing: post prev/next navigation walks the archive in date order', async ({ page }) => {
  await page.goto('/writing');
  // Newest post has no "older" link that predates it; it links back in time only.
  const newestHref = await page.locator('#post-list article a').first().getAttribute('href');
  await page.goto(newestHref!);

  const postNav = page.locator('main footer nav[aria-label="post navigation"]');
  await expect(postNav).toBeVisible();

  const olderLink = postNav.locator('a').first();
  const olderHref = await olderLink.getAttribute('href');
  expect(olderHref).toBeTruthy();
  await page.goto(olderHref!);
  await expect(page).toHaveURL(new RegExp(`${olderHref}/?$`));

  // From the older post, the right-hand link leads back to the newest.
  const olderPostNav = page.locator('main footer nav[aria-label="post navigation"]');
  await expect(olderPostNav.locator(`a[href="${newestHref}"]`)).toBeVisible();
});
