import { test, expect } from '@playwright/test';

const STATUS_URL = 'https://api.adrianlumley.co/v1/status';

test('live status: fresh heartbeat renders the live state', async ({ page }) => {
  await page.route(STATUS_URL, (route) =>
    route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({
        agent: 'rogue',
        epoch: '2026-04-15',
        last_signal: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'live',
        loops_today: 12,
      }),
    }),
  );

  await page.goto('/');
  const status = page.locator('[data-live-status]').first();
  // this doubles as the CSP regression test: if connect-src loses the api
  // origin the fetch is blocked and the state never becomes live.
  await expect(status).toHaveAttribute('data-state', 'live');
  await expect(status).toContainText('days running');
  await expect(status).toContainText('last signal 5 minutes ago');
  await expect(status).toContainText('12 loops today');
});

test('live status: unreachable api keeps the honest idle state, no errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    // resource-load failures are expected here: the status request is
    // deliberately aborted and analytics is unreachable in ci. unhandled
    // js errors are what this test guards against.
    if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource')) {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.route(STATUS_URL, (route) => route.abort('failed'));

  await page.goto('/');
  const status = page.locator('[data-live-status]').first();
  await expect(status).toHaveAttribute('data-state', 'idle');
  await expect(status).toContainText('running since april 2026');

  // give the fetch failure time to surface before asserting silence
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});

test('live status: stale heartbeat renders the quiet state, never live', async ({ page }) => {
  await page.route(STATUS_URL, (route) =>
    route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      // the payload lies and claims live; the client computes staleness
      // itself and must not believe it. gray beats false green.
      body: JSON.stringify({
        agent: 'rogue',
        epoch: '2026-04-15',
        last_signal: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        status: 'live',
      }),
    }),
  );

  await page.goto('/');
  const status = page.locator('[data-live-status]').first();
  await expect(status).toHaveAttribute('data-state', 'quiet');
  await expect(status).toContainText('rogue is quiet');
  await expect(status).toContainText('last signal 10 hours ago');
});

test('live status: lab stat is epoch-derived and updates client side', async ({ page }) => {
  await page.route(STATUS_URL, (route) => route.abort('failed'));
  await page.goto('/lab');
  const stat = page.locator('#rogue .stat-number');
  await expect(stat).toHaveText(/^\d+$/);
  const days = Number(await stat.textContent());
  // 67 was the last hardcoded value (2026-06-21); the derived count only grows
  expect(days).toBeGreaterThanOrEqual(67);
});
