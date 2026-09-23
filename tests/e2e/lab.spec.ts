import { test, expect } from '@playwright/test';

test('lab page has correct title, heading, and the ledger as its flagship', async ({ page }) => {
  await page.goto('/lab');

  // Check the page title (the same canonical form base-layout.spec asserts)
  await expect(page).toHaveTitle('Lab | Adrian Lumley');

  // Check for the main heading
  await expect(page.locator('main h1')).toHaveText('lab');

  // rogue is retired: no section, no running-since claim
  await expect(page.locator('#rogue')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('rogue');

  const pastThePilot = page.locator('#past-the-pilot');
  await expect(pastThePilot).toBeVisible();
  await expect(pastThePilot).toContainText('a public evidence ledger for enterprise ai that made it into real work');
  await expect(pastThePilot.locator('a')).toHaveText('open the ledger');
  await expect(pastThePilot.locator('a')).toHaveAttribute('href', 'https://pastthepilot.adrianlumley.co');
  await expect(pastThePilot.locator('a')).toHaveAttribute('target', '_blank');

  const fork = page.locator('#fork');
  await expect(fork).toBeVisible();
  await expect(fork).toContainText('one hard decision, three futures, three marks each');
  await expect(fork.locator('a[href="/lab/fork/"]')).toHaveText('open fork');

  const sectionIds = await page.locator('main section').evaluateAll((sections) => sections.map((section) => section.id));
  expect(sectionIds.indexOf('past-the-pilot')).toBeLessThan(sectionIds.indexOf('fork'));
  expect(sectionIds.indexOf('fork')).toBeLessThan(sectionIds.indexOf('ink-field'));

  // one short section per tool, no "also built" list, no toy cards
  const meeting = page.locator('#meeting-price-tag');
  await expect(meeting.locator('a[href="/lab/meeting-cost/"]')).toHaveText('open meeting price tag');
  await expect(meeting.locator('a[href="/writing/meeting-cost/"]')).toHaveText('why i built it');
  expect(sectionIds.indexOf('meeting-price-tag')).toBeGreaterThan(sectionIds.indexOf('fork'));
  await expect(page.locator('#also-built')).toHaveCount(0);
  await expect(page.locator('main .card')).toHaveCount(0);

  // the lab index is a record, not a pitch: no feedback gate, no eyebrows in
  // mono, labels in italic
  await expect(page.locator('#feedback-gate')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('send the sentence');
  await expect(pastThePilot.locator('.label')).toHaveText('flagship');
  await expect(pastThePilot.locator('.label')).toHaveCSS('font-style', 'italic');
});

// every toy is its own world, but none is a dead end: each carries a visible
// way back to the lab in its own type and ink.
for (const toy of ['fork', 'ink-field', 'meeting-cost']) {
  test(`lab toy ${toy} links back to the lab`, async ({ page }) => {
    await page.goto(`/lab/${toy}/`);
    const back = page.locator('a[href="/lab/"]').filter({ hasText: 'back to lab' }).first();
    await back.scrollIntoViewIfNeeded();
    await expect(back).toBeVisible();
    await back.click();
    await expect(page).toHaveURL(/\/lab\/$/);
  });
}
