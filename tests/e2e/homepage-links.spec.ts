import { test, expect } from '@playwright/test';

test('Homepage features current work and links', async ({ page }) => {
  await page.goto('/');

  // Verify the "Currently" section
  await expect(page.getByRole('heading', { name: 'currently:' })).toBeVisible();

  // Verify the "see the work" link exists
  const workLink = page.getByRole('link', { name: 'see the work' });
  await expect(workLink).toBeVisible();
  await expect(workLink).toHaveAttribute('href', '/work');

  // Verify FamilyOS mention
  await expect(page.getByRole('link', { name: 'familyos' })).toBeVisible();
});
