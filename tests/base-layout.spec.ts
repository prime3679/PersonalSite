import { test, expect } from '@playwright/test';

test.describe('Base Layout Meta Tags', () => {

  test('Home page should have correct meta tags', async ({ page }) => {
    await page.goto('/');

    // Title
    await expect(page).toHaveTitle('Adrian Lumley');

    // Charset
    const charset = await page.locator('meta[charset]').getAttribute('charset');
    expect(charset).toBe('UTF-8');

    // Viewport — should NOT have maximum-scale (accessibility)
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBe('width=device-width, initial-scale=1.0');
    expect(viewport).not.toContain('maximum-scale');

    // Description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBe('Director of Product at Salesforce, building at the intersection of AI and enterprise. Previously SiriusXM, Disney+, EA. Based in NYC.');

    // OG Title
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBe('Adrian Lumley');

    // OG Description
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    expect(ogDescription).toBe('Director of Product at Salesforce, building at the intersection of AI and enterprise. Previously SiriusXM, Disney+, EA. Based in NYC.');
  });

  test('Work page should have correct custom meta tags', async ({ page }) => {
    await page.goto('/work');

    // Title
    await expect(page).toHaveTitle('Work — Adrian Lumley');

    // Description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBe('Case studies from 14 years in product. SiriusXM, Disney+, EA — the metrics, the decisions, and what actually happened.');

    // OG Title
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBe('Work — Adrian Lumley');
  });

  test('Pages should not have double title suffix', async ({ page }) => {
    // Lab page
    await page.goto('/lab');
    await expect(page).toHaveTitle('Lab — Adrian Lumley');

    // Services page
    await page.goto('/services');
    await expect(page).toHaveTitle('Services — Adrian Lumley');

    // FamilyOS page
    await page.goto('/familyos');
    await expect(page).toHaveTitle('FamilyOS — Adrian Lumley');
  });

});
