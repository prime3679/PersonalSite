import { test, expect } from '@playwright/test';

test('Benchmark FamilyOS stats loading time with slow network', async ({ page }) => {
  // First load (normal speed) to populate cache
  await page.goto('/lab');
  await expect(page.locator('#familyos-stats-loaded')).toBeVisible();

  // Verify cache is present
  const cache = await page.evaluate(() => localStorage.getItem('familyos-stats-v1'));
  console.log('Cache populated:', !!cache);

  // Intercept the stats request to simulate network delay on reload
  await page.route('**/familyos-stats.json', async route => {
    console.log('Intercepted stats request - adding delay');
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
    await route.continue();
  });

  // Reload the page
  console.log('Reloading page...');
  await page.reload();

  const start = Date.now();
  // With cache, this should be visible almost immediately, despite the network delay
  await expect(page.locator('#familyos-stats-loaded')).toBeVisible();
  const end = Date.now();

  const duration = end - start;
  console.log(`Cached load duration with 2s network delay: ${duration}ms`);

  // Assert that it loaded much faster than the network delay
  expect(duration).toBeLessThan(500); // Should be well under the 2000ms delay
});
