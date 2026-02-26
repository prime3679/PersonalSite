import { test, expect } from '@playwright/test';

test('Homepage features current work and reading', async ({ page }) => {
  await page.goto('/');

  // Verify the "currently" section heading
  await expect(page.getByRole('heading', { name: 'currently:' })).toBeVisible();

  // Verify the "FamilyOS" project link
  const familyOSLink = page.getByRole('link', { name: 'familyos' });
  await expect(familyOSLink).toBeVisible();
  await expect(familyOSLink).toHaveAttribute('href', '/lab');

  // Verify the "stack" information
  await expect(page.getByText('stack:')).toBeVisible();
  await expect(page.getByText('astro, typescript, node.js')).toBeVisible();

  // Verify the "reading" section
  await expect(page.getByText('reading:')).toBeVisible();
  await expect(page.getByRole('link', { name: 'goodreads' })).toBeVisible();

  // Verify the "training" section
  await expect(page.getByText('training:')).toBeVisible();
  await expect(page.getByText('muay thai + jiu jitsu')).toBeVisible();
});
