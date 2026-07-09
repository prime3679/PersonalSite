import { test, expect } from '@playwright/test';

test('homepage surfaces the premium editorial opening, sections, and contact links', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('main h1')).toHaveText('AI is easy to buy. Adoption is the work.');
  await expect(page.locator('main')).toContainText('I run product where enterprise AI has to survive contact with real users.');
  await expect(page.locator('main')).toContainText('The hard part of enterprise AI was never the model.');

  await expect(page.getByRole('heading', { name: 'Selected writing' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'From the lab' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notes on making' })).toBeVisible();
  await expect(page.locator('[data-live-status]').first()).toBeVisible();
  await expect(page.locator('[data-signal-trace]')).toBeVisible();

  const writingLink = page.locator('main a[href="/writing/meeting-cost"]');
  await expect(writingLink).toBeVisible();

  const labLink = page.locator('main a[href="/lab/meeting-cost/"]');
  await expect(labLink).toBeVisible();

  const signalRoomLink = page.locator('main a[href="/signal-room"]');
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
