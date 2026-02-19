import { test, expect } from '@playwright/test';

test('Homepage has correct title and content', async ({ page }) => {
  await page.goto('/');

  // Check for the main heading
  await expect(page.locator('main h1')).toHaveText("hello, i'm adrian.");

  // Check for the role description
  await expect(page.locator('body')).toContainText('director of product management at salesforce');

  // Check for the salesforce link
  const link = page.locator('a', { hasText: 'salesforce' });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', 'https://www.salesforce.com');
});
