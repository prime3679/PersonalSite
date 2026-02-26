import { test, expect } from '@playwright/test';

test('lab page has projects and status', async ({ page }) => {
  await page.goto('/lab');

  // Verify the page heading
  await expect(page.getByRole('heading', { name: 'lab' })).toBeVisible();

  // Verify presence of key projects
  const projects = [
    'familyos',
    'bishop',
    'bishop-bench',
    'familyos-template',
    'iron log',
    'la carte'
  ];

  for (const project of projects) {
    await expect(page.getByRole('link', { name: project, exact: true })).toBeVisible();
  }

  // Verify status badges are present
  // Note: There are multiple "active" and "open source" badges, so we check if at least one is visible
  await expect(page.locator('.status-badge', { hasText: 'active' }).first()).toBeVisible();
  await expect(page.getByText('experimental', { exact: true })).toBeVisible();
  await expect(page.getByText('concept', { exact: true }).first()).toBeVisible();
});
