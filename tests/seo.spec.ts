import { expect, test } from '@playwright/test';

test.describe('technical canonicals and indexing', () => {
  test('robots.txt allows all crawlers and points at sitemap.xml', async ({ page }) => {
    const response = await page.request.get('/robots.txt');
    expect(response.status()).toBe(200);
    expect(await response.text()).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://adrianlumley.co/sitemap.xml\n',
    );
  });

  test('sitemap.xml includes canonical public routes and excludes non-indexable paths', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/xml/);

    const xml = await response.text();
    expect(xml).toContain('<loc>https://adrianlumley.co/</loc>');
    expect(xml).toContain('<loc>https://adrianlumley.co/about</loc>');
    expect(xml).toContain('<loc>https://adrianlumley.co/writing/meeting-cost</loc>');
    expect(xml).toContain('<loc>https://adrianlumley.co/signal-room/night-shift</loc>');
    expect(xml).toContain('<loc>https://adrianlumley.co/lab/fork</loc>');
    expect(xml).not.toContain('/360');
    expect(xml).not.toContain('/404');
    expect(xml).not.toContain('/rss.xml');
    expect(xml).not.toContain('/blog');
    expect(xml).not.toContain('/og/home.png');
    expect(xml).not.toContain('sitemap-index.xml');
  });

  test('indexable static html lab routes expose canonical og and twitter metadata', async ({ page }) => {
    await page.goto('/lab/fork');

    await expect(page).toHaveTitle('fork | a regret map for one hard decision');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://adrianlumley.co/lab/fork',
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'fork | a regret map for one hard decision',
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://adrianlumley.co/lab/fork',
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://adrianlumley.co/og/home.png',
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
  });

  test('/360/ stays intentionally noindex while the homepage stays indexable', async ({ page }) => {
    await page.goto('/360/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://adrianlumley.co/360',
    );

    await page.goto('/');
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });
});
