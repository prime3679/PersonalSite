import { test, expect } from '@playwright/test';

test('Homepage loads and has reveal elements', async ({ page }) => {
  await page.goto('/');

  // Check for the main heading
  await expect(page.locator('main h1')).toBeVisible();

  // Check for reveal class on sections
  const revealSection = page.locator('section.reveal').first();
  await expect(revealSection).toBeVisible();
});

test('Lab page loads and has reveal elements', async ({ page }) => {
  await page.goto('/lab');

  // Check for the main heading
  await expect(page.locator('main h1')).toContainText('lab');

  // Check for reveal class on sections (the lean lab has no project cards)
  const revealSection = page.locator('section.reveal').first();
  await expect(revealSection).toBeVisible();
});
