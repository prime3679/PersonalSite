import { test, expect } from '@playwright/test';

test('Homepage has correct title and content', async ({ page }) => {
  await page.goto('/');

  // Check for the main heading
  await expect(page.locator('main h1')).toHaveText("hello, i'm adrian.");

  // Check for the role description
  await expect(page.locator('body')).toContainText('director of product at salesforce');

  // Check for the salesforce link
  const salesforceLink = page.locator('a', { hasText: 'salesforce' });
  await expect(salesforceLink).toBeVisible();
  await expect(salesforceLink).toHaveAttribute('href', 'https://www.salesforce.com');

  // Check for "Currently" section
  await expect(page.getByText('currently:', { exact: true })).toBeVisible();
  const familyOsLink = page.locator('a', { hasText: 'familyos' });
  await expect(familyOsLink).toBeVisible();
  await expect(familyOsLink).toHaveAttribute('href', '/lab');
  await expect(page.locator('body')).toContainText('scifi novel');

  // Check for "Connect" section
  await expect(page.getByText("let's talk:", { exact: true })).toBeVisible();

  const emailLink = page.locator('a', { hasText: 'email me' });
  await expect(emailLink).toBeVisible();
  await expect(emailLink).toHaveAttribute('href', '/contact');

  const linkedinLink = page.locator('a', { hasText: 'linkedin' });
  await expect(linkedinLink).toBeVisible();
  await expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/adrianlumley/');

  const githubLink = page.locator('a', { hasText: 'github' });
  await expect(githubLink).toBeVisible();
  await expect(githubLink).toHaveAttribute('href', 'https://github.com/prime3679');
});
