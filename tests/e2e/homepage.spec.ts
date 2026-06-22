import { test, expect } from '@playwright/test';

test('homepage surfaces the current hero, sections, and contact links', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('main h1')).toHaveText('i build software that helps without getting in the way.');
  await expect(page.locator('body')).toContainText('director of product at salesforce');

  await expect(page.locator('main')).toContainText('the work');
  await expect(page.locator('main')).toContainText('the building');
  await expect(page.locator('main')).toContainText('the thinking');
  await expect(page.locator('main')).toContainText("building something in ai? i'd like to hear about it.");

  const workLink = page.locator('main a[href="/work"]');
  await expect(workLink).toBeVisible();

  const labLink = page.locator('main a[href="/lab"]');
  await expect(labLink).toBeVisible();

  const signalRoomLink = page.locator('main a[href="/signal-room"]').first();
  await expect(signalRoomLink).toBeVisible();

  const emailLink = page.locator('main a[href="/contact"]');
  await expect(emailLink).toBeVisible();
  await expect(emailLink).toHaveAttribute('href', '/contact');

  const linkedinLink = page.locator('main a[href="https://www.linkedin.com/in/adrianlumley/"]');
  await expect(linkedinLink).toBeVisible();
  await expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/adrianlumley/');

  const githubLink = page.locator('main a[href="https://github.com/prime3679"]');
  await expect(githubLink).toBeVisible();
  await expect(githubLink).toHaveAttribute('href', 'https://github.com/prime3679');
});
