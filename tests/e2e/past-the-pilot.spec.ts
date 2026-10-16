import { test, expect } from '@playwright/test';

test('past the pilot is public and checks out through the existing stripe link', async ({ page }) => {
  const response = await page.goto('/past-the-pilot/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('link', { name: 'buy past the pilot' })).toHaveAttribute(
    'href',
    'https://buy.stripe.com/28E3cx3VG6TwaMl10o6Zy01',
  );
});

test('past the pilot thanks page is public and links to contact', async ({ page }) => {
  const response = await page.goto('/past-the-pilot/thanks/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('link', { name: 'send materials via contact' })).toHaveAttribute('href', '/contact/');
});
