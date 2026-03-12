import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('blog page filters unpublished posts', async ({ page }) => {
    await page.goto('/blog');

    // Check that a published post is visible
    await expect(page.getByText('I gave an AI agent two weeks to coordinate my family')).toBeVisible();

    // Check that an unpublished post is NOT visible
    // There are two posts with this title, one published and one unpublished.
    // The unpublished one has description: "Why the best product decisions consider what happens after what happens. Lessons from scaling at Salesforce, SiriusXM, and Disney+."
    await expect(page.getByText('Lessons from scaling at Salesforce, SiriusXM, and Disney+.')).not.toBeVisible();
  });

  test('ai-cost-70-percent page has only one global footer', async ({ page }) => {
    await page.goto('/blog/ai-cost-70-percent');

    // The global footer contains "adrian lumley · nyc"
    const footerText = page.getByText('adrian lumley · nyc');

    // Should be visible
    await expect(footerText).toBeVisible();

    // Should appear only once
    await expect(footerText).toHaveCount(1);
  });
});
