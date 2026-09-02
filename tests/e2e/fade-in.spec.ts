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

test('inner pages are inked at first paint too: no reveal classes, no entrance animation', async ({ page }) => {
  for (const path of ['/lab/', '/writing/', '/about/', '/signal-room/']) {
    await page.goto(path, { waitUntil: 'commit' });
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('.reveal, .fade-in')).toHaveCount(0);

    // the first block after the page header, whatever element it is
    const firstBlock = page.locator('main > :nth-child(2)');
    await expect(firstBlock).toHaveCSS('opacity', '1');
    await expect(firstBlock).toHaveCSS('animation-name', 'none');
  }
});
