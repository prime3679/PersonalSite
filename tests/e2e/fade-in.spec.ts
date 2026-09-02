import { test, expect } from '@playwright/test';

test('Homepage record is fully inked at first paint, with no reveal fade', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });

  // Check for the main heading
  await expect(page.locator('main h1')).toBeVisible();

  // the record never fades in: no reveal class, opacity 1 immediately
  const record = page.locator('main .record');
  await expect(page.locator('main .reveal')).toHaveCount(0);
  await expect(record).toHaveCSS('opacity', '1');
  await expect(record).toHaveCSS('animation-name', 'none');
});

test('Lab page loads and has reveal elements', async ({ page }) => {
  await page.goto('/lab');

  // Check for the main heading
  await expect(page.locator('main h1')).toContainText('lab');

  // Check for reveal class on sections (the lean lab has no project cards)
  const revealSection = page.locator('section.reveal').first();
  await expect(revealSection).toBeVisible();
});
