import { test, expect } from '@playwright/test';

test('Homepage loads and has reveal elements', async ({ page }) => {
  await page.goto('/');

  // Check for the main heading
  await expect(page.locator('main h1')).toBeVisible();

  // the record itself is the reveal surface
  const revealSection = page.locator('main .reveal').first();
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
