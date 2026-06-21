import { test, expect } from '@playwright/test';

test('Homepage features current work and reading', async ({ page }) => {
  await page.goto('/');

  // Verify the currently panel is present
  await expect(page.getByText('currently', { exact: true })).toBeVisible();

  // Verify the "signal room" serial link (scoped to main; the footer also links it)
  const signalRoomLink = page.locator('main').getByRole('link', { name: 'signal room' });
  await expect(signalRoomLink).toBeVisible();
  await expect(signalRoomLink).toHaveAttribute('href', '/signal-room');

  // Verify the runtime stack information
  await expect(page.getByText('stack', { exact: true })).toBeVisible();
  await expect(page.getByText('astro, typescript, node.js')).toBeVisible();

  // Verify the "reading" section
  await expect(page.getByText('reading', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'goodreads' })).toBeVisible();

  // Verify the "training" section
  await expect(page.getByText('training', { exact: true })).toBeVisible();
  await expect(page.getByText('muay thai + jiu jitsu')).toBeVisible();
});
