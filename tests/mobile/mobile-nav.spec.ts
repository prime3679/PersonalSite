import { test, expect } from '@playwright/test';

// These run only under the mobile projects (Pixel 5 / iPhone 13), where the
// desktop nav is collapsed behind the hamburger menu.

test('mobile: hamburger menu opens and navigates', async ({ page }) => {
  await page.goto('/');

  const toggle = page.locator('#menu-toggle');
  const mobileNav = page.locator('#mobile-nav');

  await expect(toggle).toBeVisible();   // hamburger is shown on small screens
  await expect(mobileNav).toBeHidden(); // menu starts collapsed

  await toggle.click();
  await expect(mobileNav).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  await mobileNav.locator('a[href="/lab"]').click();
  await expect(page).toHaveURL(/\/lab\/?$/);
  await expect(page.locator('main h1')).toHaveText('lab');
});

test('mobile: theme toggle flips dark mode', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const before = await html.evaluate((el) => el.classList.contains('dark'));
  await page.locator('#theme-toggle').click();
  const after = await html.evaluate((el) => el.classList.contains('dark'));
  expect(after).toBe(!before);
});

test('mobile: lab category filter works on a touch viewport', async ({ page }) => {
  await page.goto('/lab');
  await expect(page.locator('#chaos-garden')).toBeVisible();

  await page.locator('button.chip[data-filter="toys"]').click();
  await expect(page.locator('#chaos-garden')).toBeVisible(); // toy
  await expect(page.locator('#bishop')).toBeHidden();         // agent
});
