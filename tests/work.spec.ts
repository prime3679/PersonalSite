import { test, expect } from '@playwright/test';

test('work page has case studies', async ({ page }) => {
  await page.goto('/work');

  // Verify the page heading
  await expect(page.getByRole('heading', { name: 'work' })).toBeVisible();

  // Verify the presence of case study companies
  await expect(page.getByText('SiriusXM', { exact: true })).toBeVisible();
  await expect(page.getByText('Disney+', { exact: true })).toBeVisible();
  await expect(page.getByText('EA (Electronic Arts)', { exact: true })).toBeVisible();
});
