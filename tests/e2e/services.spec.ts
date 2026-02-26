import { test, expect } from '@playwright/test';

test('services page loads and displays content correctly', async ({ page }) => {
  await page.goto('/services');

  // Verify the page heading
  await expect(page.getByRole('heading', { name: 'services', exact: true })).toBeVisible();

  // Verify the "ai cost audit" section
  const aiAuditSection = page.locator('article', { hasText: 'ai cost audit' });
  await expect(aiAuditSection).toBeVisible();
  await expect(aiAuditSection).toContainText('review your openai or anthropic usage');
  await expect(aiAuditSection).toContainText('spend breakdown by model and task type');

  // Verify the "product advisory" section
  const productAdvisorySection = page.locator('article', { hasText: 'product advisory' });
  await expect(productAdvisorySection).toBeVisible();
  await expect(productAdvisorySection).toContainText('occasional advisory for early-stage teams');
  await expect(productAdvisorySection).toContainText('product strategy and roadmap clarity');

  // Verify "get in touch" links point to /contact
  const contactLinks = page.getByRole('link', { name: 'get in touch' });
  await expect(contactLinks.first()).toHaveAttribute('href', '/contact');
  await expect(contactLinks.last()).toHaveAttribute('href', '/contact');

  // Verify footer note
  await expect(page.getByText('i take on a limited number of projects. if the fit is right, i\'ll say yes.')).toBeVisible();

  // Verify fade-in classes are present
  const fadeIns = page.locator('.fade-in');
  await expect(fadeIns.first()).toBeVisible();
});
