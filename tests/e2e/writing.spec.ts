import { test, expect } from '@playwright/test';

test('writing: the index is the record table, newest first, with a dek under each title', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/writing');

  const rows = page.locator('#post-list .row');
  await expect(rows).toHaveCount(5);

  const first = rows.first();
  await expect(first.locator('time')).toHaveText('July 2026');
  await expect(first.getByRole('link', { name: 'The honest record' })).toHaveAttribute('href', '/writing/the-honest-record/');
  await expect(first.locator('p')).toHaveText('People lie in journals. They perform in therapy. Nobody performs for a coding agent.');

  // the key column hugs its widest date; every title starts at the same x
  const titleXs = await page.locator('#post-list .row h2').evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().x));
  expect(new Set(titleXs.map((x) => Math.round(x))).size).toBe(1);

  // no blog kit: no tag chips, no per-post tag links, no reading times
  await expect(page.locator('.chip, #tag-filters')).toHaveCount(0);
  await expect(page.locator('main a[href*="?tag="]')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('min read');
  await expect(page.locator('main a[href="/rss.xml"]')).toBeVisible();
});

test('writing: unpublished posts do not appear on the index', async ({ page }) => {
  await page.goto('/writing');

  // familyos-building-a-family-agent.md has published: false.
  await expect(page.getByText('I gave an AI agent two weeks to coordinate my family')).toHaveCount(0);
  // ai-cost-70-percent.md and bishop-six-weeks.md are also published: false.
  await expect(page.getByText("Here's the only thing that mattered.")).toHaveCount(0);
  await expect(page.getByText('Six weeks with an AI chief of staff.')).toHaveCount(0);
});

test('writing: an essay opens with its title as the one size jump and a date line', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/writing/the-honest-record/');

  const title = page.locator('main h1');
  await expect(title).toHaveText('The honest record');
  await expect(page.locator('.page-standfirst')).toHaveText('July 8, 2026');
  await expect(page.locator('main')).not.toContainText('min read');
  await expect(page.locator('main')).not.toContainText('more on');

  const [titleSize, bodySize] = await Promise.all([
    title.evaluate((n) => Number.parseFloat(window.getComputedStyle(n).fontSize)),
    page.locator('.prose p').first().evaluate((n) => Number.parseFloat(window.getComputedStyle(n).fontSize)),
  ]);
  expect(titleSize / bodySize).toBeCloseTo(1.5, 1);
  await expect(page.locator('.prose p').first()).toHaveCSS('font-family', /Geist/);
});

test('writing: post prev/next navigation walks the archive in date order', async ({ page }) => {
  await page.goto('/writing');
  // Newest post has no "newer" row; it links back in time only.
  const newestHref = await page.locator('#post-list a').first().getAttribute('href');
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
