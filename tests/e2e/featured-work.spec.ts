import { test, expect } from '@playwright/test';

test('Homepage features case studies', async ({ page }) => {
  await page.goto('/');

  // Verify the "Featured Work" section heading
  // Note: The heading text is "featured work:", but headings are often normalized by accessibility role.
  // However, looking at index.astro: <h2 class="...">featured work:</h2>
  await expect(page.getByRole('heading', { name: 'featured work:' })).toBeVisible();

  // Verify that the case studies are present
  await expect(page.getByText('SiriusXM', { exact: true })).toBeVisible();
  await expect(page.getByText('Disney+', { exact: true })).toBeVisible();
  await expect(page.getByText('Electronic Arts', { exact: true })).toBeVisible();

  // Verify a headline to ensure data is mapped correctly
  await expect(page.getByText('18% lift in daily sessions')).toBeVisible();
  await expect(page.getByText('60+ market launch toolkit')).toBeVisible();
});
