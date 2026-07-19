import { test, expect } from '@playwright/test';

const hasDark = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.classList.contains('dark'));
const storedTheme = (page: import('@playwright/test').Page) =>
  page.evaluate(() => localStorage.getItem('theme'));

async function blockAnalytics(page: import('@playwright/test').Page) {
  await page.route('https://cloud.umami.is/**', (route) => route.abort());
}

async function expectToggleState(
  page: import('@playwright/test').Page,
  pressed: 'true' | 'false',
  themeColor: '#16130e' | '#f7f3ea',
) {
  await expect(page.locator('[data-theme-toggle]')).toHaveCount(1);
  await expect(page.locator('header [data-theme-toggle]')).toHaveAttribute('aria-pressed', pressed);
  await expect(page.locator('footer [data-theme-toggle]')).toHaveCount(0);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', themeColor);
}

test.describe('night shift theme', () => {
  test('applies dark if localStorage theme is dark', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/');
    expect(await hasDark(page)).toBe(true);
  });

  test('applies dark if no localStorage and system prefers dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addInitScript(() => localStorage.removeItem('theme'));
    await page.goto('/');
    expect(await hasDark(page)).toBe(true);
  });

  test('stays light if localStorage says light even when system prefers dark', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    expect(await hasDark(page)).toBe(false);
  });

  test('stays light if no localStorage and system prefers light', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    expect(await hasDark(page)).toBe(false);
  });

  test('main-content surface click toggles on and off, syncs state, and persists', async ({ page }) => {
    await blockAnalytics(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/about');

    const surface = page.locator('main .content-stack p').first();
    await expectToggleState(page, 'false', '#f7f3ea');

    await surface.click();
    expect(await hasDark(page)).toBe(true);
    await expectToggleState(page, 'true', '#16130e');
    expect(await storedTheme(page)).toBe('dark');

    await page.reload();
    expect(await hasDark(page)).toBe(true);
    await expectToggleState(page, 'true', '#16130e');

    await page.locator('main .content-stack p').first().click();
    expect(await hasDark(page)).toBe(false);
    await expectToggleState(page, 'false', '#f7f3ea');
    expect(await storedTheme(page)).toBe('light');

    await page.reload();
    expect(await hasDark(page)).toBe(false);
    await expectToggleState(page, 'false', '#f7f3ea');
  });

  test('header theme button stays singular, labeled, and persists', async ({ page }) => {
    await blockAnalytics(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    const toggles = page.locator('[data-theme-toggle]');
    const headerToggle = page.locator('header [data-theme-toggle]');
    await expect(toggles).toHaveCount(1);
    await expect(headerToggle).toHaveText('night shift');
    await expect(headerToggle).toBeVisible();
    await expect(page.locator('footer [data-theme-toggle]')).toHaveCount(0);
    await expectToggleState(page, 'false', '#f7f3ea');

    await headerToggle.click();
    expect(await hasDark(page)).toBe(true);
    await expectToggleState(page, 'true', '#16130e');
    expect(await storedTheme(page)).toBe('dark');

    await page.reload();
    expect(await hasDark(page)).toBe(true);
    await expectToggleState(page, 'true', '#16130e');

    await page.locator('header [data-theme-toggle]').click();
    expect(await hasDark(page)).toBe(false);
    await expectToggleState(page, 'false', '#f7f3ea');
    expect(await storedTheme(page)).toBe('light');
    await page.reload();
    expect(await hasDark(page)).toBe(false);
    await expectToggleState(page, 'false', '#f7f3ea');
  });

  test('links and form buttons do not trigger the surface toggle or persist theme', async ({ page }) => {
    await blockAnalytics(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/contact');

    const submit = page.getByRole('button', { name: 'send message' });
    await submit.evaluate((button) => button.setAttribute('type', 'button'));
    await submit.click();
    expect(await hasDark(page)).toBe(false);
    expect(await storedTheme(page)).toBe(null);
    await expectToggleState(page, 'false', '#f7f3ea');

    const workLink = page.locator('header nav[aria-label="Primary"] a').filter({ hasText: 'work' });
    await workLink.evaluate((link) => link.setAttribute('href', '#work-test'));
    await workLink.click();
    expect(await hasDark(page)).toBe(false);
    expect(await storedTheme(page)).toBe(null);
    await expectToggleState(page, 'false', '#f7f3ea');
  });
});

test.describe('night shift theme at narrow width', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('surface tap toggles on and off without needing the explicit buttons', async ({ page }) => {
    await blockAnalytics(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/about');

    const surface = page.locator('main .content-stack p').first();
    await surface.tap();
    expect(await hasDark(page)).toBe(true);
    await expectToggleState(page, 'true', '#16130e');

    await page.locator('main .content-stack p').first().tap();
    expect(await hasDark(page)).toBe(false);
    await expectToggleState(page, 'false', '#f7f3ea');
  });
});
