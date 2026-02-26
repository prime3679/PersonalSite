import { test, expect } from '@playwright/test';

test.describe('Bishop Development Log Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bishop-development');
  });

  test('has correct title and heading', async ({ page }) => {
    // Check page title in head (optional, if you want to be strict about metadata)
    await expect(page).toHaveTitle(/Bishop Development Log/);

    // Check main H1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText('bishop development log.');
  });

  test('displays key sections', async ({ page }) => {
    const sections = [
      'current status:',
      'model architecture:',
      'development phases:',
      'benchmark results:',
      'key learnings:',
      'timeline:',
    ];

    for (const sectionHeading of sections) {
      const heading = page.getByRole('heading', { name: sectionHeading, exact: true });
      await expect(heading).toBeVisible();
    }
  });

  test('renders critical content', async ({ page }) => {
    // There are multiple instances of 'cost reduction:', so we check that at least one is visible
    // or use .first() if we just want to verify presence.
    // Given the page content, it appears multiple times.
    const costReduction = page.getByText('cost reduction:');
    await expect(costReduction.first()).toBeVisible();

    await expect(page.getByText('anthropic', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('phase 1: architecture', { exact: false })).toBeVisible();
  });

  test('has link to full playbook', async ({ page }) => {
    const link = page.getByRole('link', { name: 'full playbook' });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/playbook');
  });
});
