import { test, expect } from '@playwright/test';

test('Homepage has correct title and content', async ({ page }) => {
  await page.goto('/');

  // Check for the main heading
  await expect(page.locator('main h1')).toHaveText("hello, i'm adrian.");

  // Check for the role description
  // Updated text content based on actual file
  await expect(page.locator('body')).toContainText('director of product at salesforce, working at the intersection of ai and enterprise');

  // Check for the salesforce link
  const link = page.locator('a', { hasText: 'salesforce' });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', 'https://www.salesforce.com');
});
