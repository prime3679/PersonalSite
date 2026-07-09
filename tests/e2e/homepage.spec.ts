import { test, expect } from '@playwright/test';

test('homepage opens with a factual identity, the real work, and contact links', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('main h1')).toHaveText('adrian lumley');
  await expect(page.locator('main')).toContainText('where ai meets enterprise adoption');
  await expect(page.locator('main')).toContainText('director of product · salesforce');
  // the old manifesto/thesis copy must be gone
  await expect(page.locator('main')).not.toContainText('The hard part of enterprise AI was never the model.');
  await expect(page.locator('main')).not.toContainText('Notes on making');

  await expect(page.getByRole('heading', { name: 'writing', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'lab', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'signal room', exact: true })).toBeVisible();
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
