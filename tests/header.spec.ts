import { test, expect } from '@playwright/test';

test.describe('Header Component', () => {
  test('Theme toggle switches theme and persists in localStorage', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('#theme-toggle');
    const html = page.locator('html');
    const sunIcon = page.locator('#sun-icon');
    const moonIcon = page.locator('#moon-icon');

    // Get initial state
    const initialClass = await html.getAttribute('class') || '';
    const isDarkInitially = initialClass.includes('dark');

    // 1. Click to toggle
    await toggle.click();

    // Determine expected state
    const expectedDark = !isDarkInitially;
    const expectedTheme = expectedDark ? 'dark' : 'light';

    // Verify HTML class
    if (expectedDark) {
      await expect(html).toHaveClass(/dark/);
    } else {
      await expect(html).not.toHaveClass(/dark/);
    }

    // Verify LocalStorage
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe(expectedTheme);

    // Verify Icons
    if (expectedDark) {
      await expect(sunIcon).toBeVisible();
      await expect(moonIcon).not.toBeVisible();
    } else {
      await expect(sunIcon).not.toBeVisible();
      await expect(moonIcon).toBeVisible();
    }

    // 2. Click to toggle back
    await toggle.click();

    // Verify return to initial state
    if (isDarkInitially) {
      await expect(html).toHaveClass(/dark/);
      await expect(sunIcon).toBeVisible();
    } else {
      await expect(html).not.toHaveClass(/dark/);
      await expect(moonIcon).toBeVisible();
    }
  });
});
