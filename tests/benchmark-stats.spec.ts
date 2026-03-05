import { test, expect } from '@playwright/test';

test('Benchmark FamilyOS stats request frequency', async ({ page }) => {
  let requestCount = 0;

  // Intercept and count requests to the stats endpoint
  await page.route('**/familyos-stats.json', async route => {
    requestCount++;
    await route.continue();
  });

  // 1. Initial Load
  console.log('--- Initial Load ---');
  await page.goto('/lab');

  // Wait for the stats to be visible to ensure the request has been made
  await expect(page.locator('#familyos-stats-loaded')).toBeVisible();

  const initialRequests = requestCount;
  console.log(`Requests after initial load: ${initialRequests}`);

  // 2. Reload Page
  console.log('--- Reloading Page ---');
  await page.reload();

  // Wait again
  await expect(page.locator('#familyos-stats-loaded')).toBeVisible();

  const totalRequests = requestCount;
  const reloadRequests = totalRequests - initialRequests;
  console.log(`Requests after reload: ${totalRequests} (New: ${reloadRequests})`);

  // With optimization, we expect NO new requests on reload (since cache is fresh)
  expect(reloadRequests).toBe(0);
});
