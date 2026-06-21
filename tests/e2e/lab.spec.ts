import { test, expect } from '@playwright/test';

test('Lab page has correct title, heading, and projects', async ({ page }) => {
  await page.goto('/lab');

  // Check the page title
  await expect(page).toHaveTitle('Lab — Adrian Lumley — Adrian Lumley');

  // Check for the main heading
  await expect(page.locator('main h1')).toHaveText('lab');

  // Check that key project elements are visible
  await expect(page.locator('#familyos')).toBeVisible();
  await expect(page.locator('#bishop')).toBeVisible();
});
