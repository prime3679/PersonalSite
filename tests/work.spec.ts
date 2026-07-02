import { test, expect } from '@playwright/test';

test('work page has case studies', async ({ page }) => {
  await page.goto('/work');

  // Verify the page heading
  await expect(page.getByRole('heading', { name: 'work' })).toBeVisible();

  // Verify the presence of case study companies (eyebrows)
  await expect(page.getByText('Salesforce', { exact: true })).toBeVisible();
  await expect(page.getByText('SiriusXM', { exact: true })).toBeVisible();
  await expect(page.getByText('Disney+', { exact: true })).toBeVisible();
  await expect(page.getByText('EA', { exact: true })).toBeVisible();

  // Verify the four case studies by their real headings
  await expect(page.getByRole('heading', { name: 'enterprise ai adoption, 0 to 1' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'cross-platform listening growth' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'global launch operations' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'building the EA Sports companion app from zero' })).toBeVisible();

  // Verify a restrained mono numbers line renders for a quantified case study
  await expect(page.getByText('18% more daily sessions · 12% churn reduction')).toBeVisible();
});
