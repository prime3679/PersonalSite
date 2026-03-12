import { test, expect } from '@playwright/test';

test.describe('Theme Logic', () => {

  test('should apply dark theme if localStorage theme is dark', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });

    await page.goto('/');

    const hasDarkClass = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDarkClass).toBe(true);
  });

  test('should apply dark theme if no localStorage and system prefers dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    // Clear localStorage just in case
    await page.addInitScript(() => {
      localStorage.removeItem('theme');
    });

    await page.goto('/');

    const hasDarkClass = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDarkClass).toBe(true);
  });

  test('should not apply dark theme if localStorage theme is light', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'light');
    });
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.goto('/');

    const hasDarkClass = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDarkClass).toBe(false);
  });

  test('should not apply dark theme if no localStorage and system prefers light', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });

    await page.goto('/');

    const hasDarkClass = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDarkClass).toBe(false);
  });

});
