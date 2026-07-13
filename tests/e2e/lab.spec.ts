import { test, expect } from '@playwright/test';

test('lab page has correct title, heading, and rogue card', async ({ page }) => {
  await page.goto('/lab');

  // Check the page title
  await expect(page).toHaveTitle('lab · Adrian Lumley');

  // Check for the main heading
  await expect(page.locator('main h1')).toHaveText('lab');

  // The flagship rogue card is visible and describes the agent
  const rogueCard = page.locator('#rogue');
  await expect(rogueCard).toBeVisible();
  await expect(rogueCard).toContainText('agent');

  // The current lean flagship keeps a factual running-since receipt instead of a stat tile.
  await expect(rogueCard).toContainText('running since');

  // The "also built" section is a plain-text row of links, not toy cards
  const alsoBuilt = page.locator('#also-built');
  await expect(alsoBuilt).toBeVisible();
  await expect(alsoBuilt.locator('a[href="/lab/the-cap-is-gone/"]')).toHaveText('the cap is gone');
  await expect(alsoBuilt.locator('a')).not.toHaveCount(0);
  await expect(alsoBuilt.locator('.card')).toHaveCount(0);
});
