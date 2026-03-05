import { test, expect } from '@playwright/test';

test('bishop development page has correct content', async ({ page }) => {
  await page.goto('/bishop-development');

  // Verify the page title
  await expect(page).toHaveTitle('Bishop — Adrian Lumley');

  // Verify the main heading
  await expect(page.getByRole('heading', { name: 'bishop development log.' })).toBeVisible();

  // Verify some key text content
  await expect(page.getByText('real-time documentation of building an AI chief of staff')).toBeVisible();
});
