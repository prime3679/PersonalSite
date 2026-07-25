import { test, expect } from '@playwright/test';

const STATUS_HOST = 'api.adrianlumley.co';

// The status endpoint is opt-in (PUBLIC_ROGUE_STATUS_URL). The default build
// ships no url, so the live layer must not request the dormant status worker
// and must keep the honest gray idle state. The live/quiet/stale decision logic
// itself is unit-tested in src/data/rogue.test.ts (evaluateStatus).

test('live status: default build never requests the dormant status endpoint', async ({ page }) => {
  const statusRequests: string[] = [];
  page.on('request', (req) => {
    if (req.url().includes(STATUS_HOST)) statusRequests.push(req.url());
  });

  await page.goto('/');
  const status = page.locator('[data-live-status]').first();
  await expect(status).toHaveAttribute('data-state', 'idle');
  await expect(status).toContainText('running since april 2026');

  // give any deferred fetch a chance to fire before asserting silence
  await page.waitForTimeout(1000);
  expect(statusRequests).toEqual([]);
});

test('live status: default build produces no unhandled console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    // resource-load failures (e.g. analytics unreachable in ci) are expected;
    // unhandled js errors are what this test guards against.
    if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource')) {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('/');
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});

test('lab uses the factual running-since receipt instead of a stale stat tile', async ({ page }) => {
  await page.goto('/lab');
  const rogue = page.locator('#rogue');
  await expect(rogue).toContainText('running since april 2026');
  await expect(rogue.locator('.stat-number')).toHaveCount(0);
});
