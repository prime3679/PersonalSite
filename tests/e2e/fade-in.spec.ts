import { test, expect } from '@playwright/test';

test('FamilyOS page loads and has fade-in elements', async ({ page }) => {
  await page.goto('/familyos');

  // Check for the main heading
  await expect(page.locator('main h1')).toContainText('familyos');

  // Check for fade-in class on sections
  const fadeInSection = page.locator('section.fade-in').first();
  await expect(fadeInSection).toBeVisible();
});

test('Lab page loads and has fade-in elements', async ({ page }) => {
  await page.goto('/lab');

  // Check for the main heading
  await expect(page.locator('main h1')).toContainText('lab');

  // Check for fade-in class on sections
  const fadeInSection = page.locator('section.fade-in').first();
  await expect(fadeInSection).toBeVisible();
});
