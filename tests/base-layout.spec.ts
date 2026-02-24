import { test, expect } from '@playwright/test';

test.describe('Base Layout Meta Tags', () => {

  test('Home page should have correct meta tags', async ({ page }) => {
    await page.goto('/');

    // Title
    await expect(page).toHaveTitle('Adrian Lumley');

    // Charset
    const charset = await page.locator('meta[charset]').getAttribute('charset');
    expect(charset).toBe('UTF-8');

    // Referrer Policy
    const referrer = await page.locator('meta[name="referrer"]').getAttribute('content');
    expect(referrer).toBe('strict-origin-when-cross-origin');

    // Viewport
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBe('width=device-width, initial-scale=1.0, maximum-scale=1');

    // Description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBe('Director of Product at Salesforce, building at the intersection of AI and enterprise. Previously SiriusXM, Disney+, EA. Based in NYC.');

    // OG Title
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBe('Adrian Lumley');

    // OG Description
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    expect(ogDescription).toBe('Director of Product at Salesforce, building at the intersection of AI and enterprise. Previously SiriusXM, Disney+, EA. Based in NYC.');

    // OG Image
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toContain('https://adrianlumley.co/');
    expect(ogImage).toContain('og-image');
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

});
