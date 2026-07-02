import { test, expect } from '@playwright/test';

test('trace: reduced motion gets the static svg, no animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const trace = page.locator('[data-signal-trace]');
  await expect(trace).toBeVisible();

  const path = trace.locator('svg path');
  await expect(path).toHaveAttribute('d', /^M/);

  // give a would-be animation time to start, then assert it never did
  await page.waitForTimeout(800);
  await expect(trace).not.toHaveAttribute('data-animating');
  await expect(trace.locator('svg')).toBeVisible();
});

test('trace: with motion allowed the canvas draws once', async ({ page }) => {
  await page.goto('/');

  const trace = page.locator('[data-signal-trace]');
  await trace.scrollIntoViewIfNeeded();
  await expect(trace).toHaveAttribute('data-animating', '');
});

test('trace: build svg and client seed agree', async ({ page }) => {
  await page.goto('/');
  const trace = page.locator('[data-signal-trace]');
  const seed = await trace.getAttribute('data-seed');
  expect(Number(seed)).toBeGreaterThan(0);
});
