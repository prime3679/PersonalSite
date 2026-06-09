import { test, expect } from '@playwright/test';

test('blog: tag chip filters posts and syncs the URL', async ({ page }) => {
  await page.goto('/blog');

  const systemsPost = page.locator('article.blog-post:has(a[href="/blog/second-order-effects"])');
  const aiOnlyPost = page.locator('article.blog-post:has(a[href="/blog/claude-gmail-connector-data"])');

  await expect(systemsPost).toBeVisible();
  await expect(aiOnlyPost).toBeVisible();

  await page.locator('button.chip[data-tag="systems"]').click();

  await expect(systemsPost).toBeVisible();   // second-order-effects is tagged systems
  await expect(aiOnlyPost).toBeHidden();      // claude-gmail is ai only
  await expect(page).toHaveURL(/\?tag=systems/);
  await expect(page.locator('button.chip[data-tag="systems"]')).toHaveAttribute('aria-pressed', 'true');
});

test('blog: ?tag= deep link applies the filter on load', async ({ page }) => {
  await page.goto('/blog?tag=building');

  await expect(page.locator('article.blog-post:has(a[href="/blog/joytap-one-sprint"])')).toBeVisible();
  await expect(page.locator('article.blog-post:has(a[href="/blog/meeting-cost"])')).toBeHidden();
  await expect(page.locator('button.chip[data-tag="building"]')).toHaveAttribute('aria-pressed', 'true');
});

test('blog: reading time shows on the index and a post', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.locator('article.blog-post').first()).toContainText('min read');

  await page.goto('/blog/meeting-cost');
  await expect(page.locator('main')).toContainText('min read');
});

test('post: clicking a tag pill lands on the filtered blog index', async ({ page }) => {
  await page.goto('/blog/meeting-cost'); // tagged product, cost
  await page.locator('a[href="/blog?tag=product"]').first().click();

  await expect(page).toHaveURL(/\/blog\?tag=product/);
  await expect(page.locator('button.chip[data-tag="product"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('article.blog-post:has(a[href="/blog/meeting-cost"])')).toBeVisible();
  await expect(page.locator('article.blog-post:has(a[href="/blog/claude-gmail-connector-data"])')).toBeHidden();
});

test('post: shows a "more on <tag>" related list', async ({ page }) => {
  await page.goto('/blog/ai-cost-70-percent'); // primary tag: ai
  await expect(page.getByText('more on ai')).toBeVisible();
  await expect(page.locator('a[href="/blog/bishop-six-weeks"]')).toBeVisible();
});

test('lab: category chip filters project cards', async ({ page }) => {
  await page.goto('/lab');
  await expect(page.locator('#bishop')).toBeVisible();
  await expect(page.locator('#chaos-garden')).toBeVisible();

  await page.locator('button.chip[data-filter="toys"]').click();

  await expect(page.locator('#chaos-garden')).toBeVisible(); // toy
  await expect(page.locator('#bishop')).toBeHidden();         // agent
  await expect(page.locator('button.chip[data-filter="toys"]')).toHaveAttribute('aria-pressed', 'true');
});

test('404: custom page renders in the site voice', async ({ page }) => {
  await page.goto('/this-page-does-not-exist');
  await expect(page.locator('main')).toContainText('lost the signal.');
});

test('rss: /rss.xml is served as XML with items', async ({ page }) => {
  const resp = await page.request.get('/rss.xml');
  expect(resp.status()).toBe(200);
  expect(resp.headers()['content-type']).toContain('xml');
  const body = await resp.text();
  expect(body).toContain('<rss');
  expect(body).toContain('<item>');
});

test('header: theme toggle flips dark mode', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const before = await html.evaluate((el) => el.classList.contains('dark'));
  await page.locator('#theme-toggle').click();
  const after = await html.evaluate((el) => el.classList.contains('dark'));
  expect(after).toBe(!before);
});

test('nav: unified header includes the /now link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header a[href="/now"]').first()).toBeVisible();
});
