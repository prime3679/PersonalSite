import { test, expect } from '@playwright/test';

test('Homepage has correct title and content', async ({ page }) => {
  await page.goto('/');

  // Check for the main heading
  await expect(page.locator('main h1')).toHaveText('a personal operating system, run in public.');

  // Check for the role description
  await expect(page.locator('body')).toContainText('director of product at salesforce');

  // Check for the salesforce link
  const salesforceLink = page.locator('a', { hasText: 'salesforce' });
  await expect(salesforceLink).toBeVisible();
  await expect(salesforceLink).toHaveAttribute('href', 'https://www.salesforce.com');

  // Check for "Currently" section content
  await expect(page.getByText('currently', { exact: true })).toBeVisible();
  const signalRoomLink = page.locator('main a', { hasText: 'signal room' });
  await expect(signalRoomLink).toBeVisible();
  await expect(signalRoomLink).toHaveAttribute('href', '/signal-room');

  // Check for the contact route in the channel list
  await expect(page.getByText('open a channel', { exact: true })).toBeVisible();

  const contactLink = page.locator('main a', { hasText: 'open a channel' });
  await expect(contactLink).toBeVisible();
  await expect(contactLink).toHaveAttribute('href', '/contact');
});
