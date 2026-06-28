import { test, expect } from '@playwright/test';

test('signal room: index lists every episode newest-first', async ({ page }) => {
  await page.goto('/signal-room');

  await expect(page.locator('main h1')).toHaveText('signal room');

  const links = page.locator('section:has(h2:has-text("episodes")) a[href^="/signal-room/"]');
  await expect(links).toHaveCount(8);
  await expect(links.first()).toContainText('the narrow door');
  await expect(links.last()).toContainText('night shift');
});

test('signal room: an episode page renders prose and serial nav', async ({ page }) => {
  await page.goto('/signal-room/night-shift');

  await expect(page.locator('main h1')).toHaveText('night shift');
  await expect(page.locator('main')).toContainText('Mission Control dimmed itself to twelve percent');

  // Consistent date rendered from frontmatter (not the old vague badges).
  // textContent is natural-case; CSS uppercases it for display.
  await expect(page.locator('main')).toContainText('May 18, 2026');

  // First episode: no prev, next points at episode 02
  await expect(page.locator('a[href="/signal-room/green-is-not-healthy/"]')).toBeVisible();
  await expect(page.locator('a[href="/signal-room/"]').first()).toBeVisible();
});

test('signal room: the index shows a date for each episode', async ({ page }) => {
  await page.goto('/signal-room');
  await expect(page.locator('main')).toContainText('June 29, 2026');
  await expect(page.locator('main')).toContainText('June 22, 2026');
  await expect(page.locator('main')).toContainText('June 21, 2026');
  await expect(page.locator('main')).toContainText('June 8, 2026');
  await expect(page.locator('main')).toContainText('May 18, 2026');
});

test('signal room: an episode has a per-episode OG card that is served', async ({ page }) => {
  await page.goto('/signal-room/the-purchasing-agent');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /\/og\/signal-room\/the-purchasing-agent\.png$/,
  );

  // The generated PNG is actually built and served (relative path → preview server)
  const img = await page.request.get('/og/signal-room/the-purchasing-agent.png');
  expect(img.status()).toBe(200);
  expect(img.headers()['content-type']).toContain('image/png');
});

test('signal room: episodes appear in the rss feed', async ({ page }) => {
  const resp = await page.request.get('/rss.xml');
  expect(resp.status()).toBe(200);
  const body = await resp.text();
  expect(body).toContain('signal room 08 · the narrow door');
  expect(body).toContain('signal room 07 · last green light');
  expect(body).toContain('signal room 06 · the snooze window');
  expect(body).toContain('signal room 01 · night shift');
  expect(body).toContain('/signal-room/the-narrow-door');
  expect(body).toContain('/signal-room/last-green-light');
  expect(body).toContain('/signal-room/the-snooze-window');
  expect(body).toContain('/signal-room/the-purchasing-agent');
});
