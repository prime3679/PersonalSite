import { test, expect } from '@playwright/test';

test('FamilyOS page has correct structure and content', async ({ page }) => {
  await page.goto('/familyos');

  // Verify the page title (taking into account the suffix from Base layout)
  await expect(page).toHaveTitle('FamilyOS — Adrian Lumley — Adrian Lumley');

  // Verify the main heading
  await expect(page.locator('h1')).toHaveText('familyos');

  // Verify the presence of the main content sections using their uppercase text
  await expect(page.locator('h2', { hasText: 'the problem' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'how it works' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'architecture' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'roadmap' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'principles' })).toBeVisible();

  // Verify the presence of roadmap items
  await expect(page.locator('text=v0.1').first()).toBeVisible();
  await expect(page.locator('text=single-agent coordination (daycare + date nights)')).toBeVisible();

  // Verify the GitHub link at the bottom
  const githubLink = page.locator('a[href="https://github.com/prime3679/familyos-template"]');
  await expect(githubLink).toBeVisible();
  await expect(githubLink).toHaveText('follow along on github ↗');
});
