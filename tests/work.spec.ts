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
  await expect(work.locator('dt')).toHaveText([
    'Salesforce',
    'SiriusXM',
    'Disney/ESPN',
    'Hyperscience',
    'EA Sports',
  ]);
  await expect(page.locator('#hyperscience')).toHaveText('Hyperscience');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'about adrian lumley: product leader, fourteen years in, director of product at salesforce on emerging technology. previously siriusxm, disney/espn, hyperscience, and ea sports.',
  );
  await expect(work.getByText(/18% more daily sessions/)).toBeVisible();
  await expect(work.getByText(/what makes it stick after the first rollout/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'open to' })).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText(/advisory|consulting|past the pilot/i);
});

test('/work/#<company> keeps its anchor on the about page', async ({ page }) => {
  await page.goto('/work/#siriusxm');
  await page.waitForURL(/\/about\/#siriusxm$/);
  await expect(page.locator('#siriusxm')).toContainText('SiriusXM');
});
