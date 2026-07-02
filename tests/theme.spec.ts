import { test, expect } from '@playwright/test';

const hasDark = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.classList.contains('dark'));

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

  test('footer toggle flips the theme, updates aria, and persists', async ({ page }) => {
    // analytics is unreachable in ci and can stall the load event across
    // the repeated reloads below; fail it fast instead.
    await page.route('https://cloud.umami.is/**', (route) => route.abort());
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    const toggle = page.locator('[data-theme-toggle]');
    await expect(toggle).toHaveText('night shift');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await toggle.click();
    expect(await hasDark(page)).toBe(true);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#16130e');

    await page.reload();
    expect(await hasDark(page)).toBe(true);

    await page.locator('[data-theme-toggle]').click();
    expect(await hasDark(page)).toBe(false);
    await page.reload();
    expect(await hasDark(page)).toBe(false);
  });
});
