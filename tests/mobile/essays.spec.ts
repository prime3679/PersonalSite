import { test, expect } from '@playwright/test';

// long inline code (tool names, json) once pushed three essays sideways on
// phones. every published essay must fit the narrowest supported width.
test('mobile: no essay scrolls horizontally at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/writing/');

  const hrefs = await page.locator('#post-list h2 a').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')!),
  );
  expect(hrefs.length).toBeGreaterThan(0);

  for (const href of hrefs) {
    await page.goto(href);
    await expect(page.locator('main h1')).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth, `${href} scrolls sideways`).toBeLessThanOrEqual(320);
  }
});
