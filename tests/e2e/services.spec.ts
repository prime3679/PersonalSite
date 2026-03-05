import { test, expect } from '@playwright/test';

test('Services page has correct title and structural elements', async ({ page }) => {
  // Navigate to the services page
  await page.goto('/services');

  // Verify the page title
  // Base.astro automatically appends " — Adrian Lumley" unless title is exactly "Adrian Lumley"
  // So if we pass "Services — Adrian Lumley", we get "Services — Adrian Lumley — Adrian Lumley"
  await expect(page).toHaveTitle('Services — Adrian Lumley — Adrian Lumley');

  // Verify the main heading
  await expect(page.locator('main h1')).toHaveText('services');

  // Verify the introduction paragraph
  await expect(page.locator('main section p').first()).toContainText('occasional consulting on ai cost optimization and product strategy');

  // Verify specific service sections exist
  await expect(page.locator('article h2', { hasText: 'ai cost audit' })).toBeVisible();
  await expect(page.locator('article h2', { hasText: 'product advisory' })).toBeVisible();

  // Verify there are multiple "get in touch" links that point to the contact page
  const contactLinks = page.locator('main a[href="/contact"]');
  await expect(contactLinks).toHaveCount(2);

  for (let i = 0; i < await contactLinks.count(); i++) {
    await expect(contactLinks.nth(i)).toHaveText('get in touch');
  }

  // Verify the footer note
  await expect(page.locator('main > p.text-muted-foreground')).toContainText("i take on a limited number of projects");
});
