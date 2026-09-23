import { test, expect } from '@playwright/test';

test('/work/ redirects to the work record on the about page', async ({ page }) => {
  await page.goto('/work/');
  await page.waitForURL(/\/about\/#work$/);
  await expect(page.getByRole('heading', { name: 'about', level: 1 })).toBeVisible();
});

test('about page carries the work record, one row per role', async ({ page }) => {
  await page.goto('/about/');
  const work = page.locator('#work');
  await expect(work.getByRole('heading', { name: 'work' })).toBeVisible();
  for (const company of ['Salesforce', 'SiriusXM', 'Disney+', 'EA']) {
    await expect(work.getByText(company, { exact: true })).toBeVisible();
  }
  await expect(work.getByText(/18% more daily sessions/)).toBeVisible();
});

test('/work/#<company> keeps its anchor on the about page', async ({ page }) => {
  await page.goto('/work/#siriusxm');
  await page.waitForURL(/\/about\/#siriusxm$/);
  await expect(page.locator('#siriusxm')).toContainText('SiriusXM');
});
