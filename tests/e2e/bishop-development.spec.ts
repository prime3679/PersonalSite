import { test, expect } from '@playwright/test';

test('bishop development log page loads and displays content correctly', async ({ page }) => {
  await page.goto('/bishop-development');

  // Verify the page title
  await expect(page).toHaveTitle('Bishop Development Log — Adrian Lumley');

  // Verify the main heading
  await expect(page.getByRole('heading', { name: 'bishop development log.' })).toBeVisible();

  // Verify the description text
  await expect(page.getByText('real-time documentation of building an AI chief of staff')).toBeVisible();

  // Verify "current status" section
  await expect(page.getByRole('heading', { name: 'current status:' })).toBeVisible();
  await expect(page.getByText('cost reduction: 70%+ on operational/cron costs vs baseline')).toBeVisible();

  // Verify "model architecture" section
  await expect(page.getByRole('heading', { name: 'model architecture:' })).toBeVisible();
  await expect(page.getByText('anthropic', { exact: true })).toBeVisible();
  await expect(page.getByText('opus 4.6 → complex/strategic work')).toBeVisible();

  // Verify "development phases" section
  await expect(page.getByRole('heading', { name: 'development phases:' })).toBeVisible();
  await expect(page.getByText('phase 1: architecture & infrastructure')).toBeVisible();

  // Verify "benchmark results" section
  await expect(page.getByRole('heading', { name: 'benchmark results:' })).toBeVisible();
  await expect(page.getByText('haiku 3.5', { exact: true })).toBeVisible();

  // Verify "key learnings" section
  await expect(page.getByRole('heading', { name: 'key learnings:' })).toBeVisible();
  await expect(page.getByText('what worked')).toBeVisible();
  await expect(page.getByText('what didn\'t')).toBeVisible();

  // Verify "timeline" section
  await expect(page.getByRole('heading', { name: 'timeline:' })).toBeVisible();
  await expect(page.getByText('feb 13-16')).toBeVisible();

  // Verify footer content
  await expect(page.getByText('last updated: february 18, 2026')).toBeVisible();

  // Verify playbook link
  const playbookLink = page.getByRole('link', { name: 'full playbook' });
  await expect(playbookLink).toBeVisible();
  await expect(playbookLink).toHaveAttribute('href', '/playbook');
});
