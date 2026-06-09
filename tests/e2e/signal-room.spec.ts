import { test, expect } from '@playwright/test';

test('signal room: index lists every episode newest-first', async ({ page }) => {
  await page.goto('/signal-room');

  await expect(page.locator('main h1')).toHaveText('signal room');

  const links = page.locator('main a[href^="/signal-room/"]');
  await expect(links).toHaveCount(4);
  await expect(links.first()).toContainText('the purchasing agent');
  await expect(links.last()).toContainText('night shift');
});

test('signal room: an episode page renders prose and serial nav', async ({ page }) => {
  await page.goto('/signal-room/night-shift');

  await expect(page.locator('main h1')).toHaveText('night shift');
  await expect(page.locator('main')).toContainText('Mission Control dimmed itself to twelve percent');

  // First episode: no prev, next points at episode 02
  await expect(page.locator('a[href="/signal-room/green-is-not-healthy/"]')).toBeVisible();
  await expect(page.locator('a[href="/signal-room/"]').first()).toBeVisible();
});

test('signal room: episodes appear in the rss feed', async ({ page }) => {
  const resp = await page.request.get('/rss.xml');
  expect(resp.status()).toBe(200);
  const body = await resp.text();
  expect(body).toContain('signal room 01 · night shift');
  expect(body).toContain('/signal-room/the-purchasing-agent');
});
