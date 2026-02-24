import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {

  test('skip-to-content link exists and targets #main-content', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toHaveCount(1);
    await expect(skipLink).toContainText('Skip to content');

    // Verify the target exists
    const target = page.locator('#main-content');
    await expect(target).toHaveCount(1);
  });

  test('active nav link has aria-current="page"', async ({ page }) => {
    await page.goto('/work');

    const activeLink = page.locator('nav[aria-label="Main navigation"] a[aria-current="page"]');
    await expect(activeLink).toHaveCount(1);
    await expect(activeLink).toHaveText('work');
  });

  test('nav elements have aria-labels', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('nav[aria-label="Main navigation"]')).toHaveCount(1);
    await expect(page.locator('nav[aria-label="Footer navigation"]')).toHaveCount(1);
  });

  test('viewport meta does not restrict zoom', async ({ page }) => {
    await page.goto('/');

    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).not.toContain('maximum-scale');
    expect(viewport).not.toContain('user-scalable=no');
  });

});

test.describe('Navigation consistency', () => {

  test('footer nav includes all main sections', async ({ page }) => {
    await page.goto('/');

    const footerNav = page.locator('nav[aria-label="Footer navigation"]');
    await expect(footerNav.locator('a[href="/work"]')).toHaveCount(1);
    await expect(footerNav.locator('a[href="/blog"]')).toHaveCount(1);
    await expect(footerNav.locator('a[href="/services"]')).toHaveCount(1);
    await expect(footerNav.locator('a[href="/lab"]')).toHaveCount(1);
    await expect(footerNav.locator('a[href="/bishop-development"]')).toHaveCount(1);
    await expect(footerNav.locator('a[href="/contact"]')).toHaveCount(1);
  });

});

test.describe('Blog post layout', () => {

  test('AI cost blog post has Header and single footer', async ({ page }) => {
    await page.goto('/blog/ai-cost-70-percent');

    // Should have header navigation
    await expect(page.locator('nav[aria-label="Main navigation"]')).toHaveCount(1);

    // Should have exactly one site footer (from Base layout)
    const footerNavs = page.locator('nav[aria-label="Footer navigation"]');
    await expect(footerNavs).toHaveCount(1);

    // Title should not have double suffix
    const title = await page.title();
    expect(title).not.toContain('Adrian Lumley — Adrian Lumley');
  });

  test('FamilyOS blog post has correct title', async ({ page }) => {
    await page.goto('/blog/familyos-building-a-family-agent');

    const title = await page.title();
    expect(title).not.toContain('Adrian Lumley — Adrian Lumley');
    expect(title).toContain('— Adrian Lumley');
  });

});

test.describe('404 page', () => {

  test('404 page renders for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');

    // Should show 404 content
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.locator('a[href="/"]')).toBeVisible();
  });

});

test.describe('Dead links', () => {

  test('bishop-development page has no link to /playbook', async ({ page }) => {
    await page.goto('/bishop-development');

    const playBookLink = page.locator('a[href="/playbook"]');
    await expect(playBookLink).toHaveCount(0);
  });

});
