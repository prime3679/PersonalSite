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

    // Viewport, no maximum-scale: pinch-zoom must stay available (WCAG 1.4.4)
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBe('width=device-width, initial-scale=1.0');

    // Description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBe('director of product at salesforce. before that, disney+, siriusxm, and ea. building ai systems hands-on on a mac mini in nyc.');

    // OG Title
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBe('Adrian Lumley');

    // OG Description
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    expect(ogDescription).toBe('director of product at salesforce. before that, disney+, siriusxm, and ea. building ai systems hands-on on a mac mini in nyc.');

    // OG Image (home uses a custom generated card at /og/home.png)
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toContain('https://adrianlumley.co/');
    expect(ogImage).toContain('/og/home.png');
  });

  test('Work page should have correct custom meta tags', async ({ page }) => {
    await page.goto('/work');

    // Title
    await expect(page).toHaveTitle('work · Adrian Lumley');

    // Description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBe('case studies from fourteen years in product: salesforce, siriusxm, disney+, and ea.');

    // OG Title
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBe('work · Adrian Lumley');
  });

});
