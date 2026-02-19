import { test, expect } from '@playwright/test';

test('blog page filters unpublished posts', async ({ page }) => {
  await page.goto('/blog');

  // Check that a published post is visible
  await expect(page.getByText('I gave an AI agent two weeks to coordinate my family')).toBeVisible();

  // Check that an unpublished post is NOT visible
  await expect(page.getByText('Second-order effects in product organizations')).not.toBeVisible();
});
