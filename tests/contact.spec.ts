import { test, expect } from '@playwright/test';

test('contact form is present with all fields', async ({ page }) => {
  await page.goto('/contact');

  // Verify the form is present
  const form = page.locator('form');
  await expect(form).toBeVisible();

  // Verify the name input is present
  const nameInput = page.locator('input[name="name"]');
  await expect(nameInput).toBeVisible();

  // Verify the email input is present
  const emailInput = page.locator('input[name="email"]');
  await expect(emailInput).toBeVisible();

  // Verify the subject input is present
  const subjectInput = page.locator('input[name="subject"]');
  await expect(subjectInput).toBeVisible();

  // Verify the message textarea is present
  const messageInput = page.locator('textarea[name="message"]');
  await expect(messageInput).toBeVisible();

  // Verify the submit button is present
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeVisible();

  // Verify the honeypot field is present but hidden
  const honeypotInput = page.locator('input[name="_gotcha"]');
  await expect(honeypotInput).toBeHidden();

  // Verify the post-submit redirect target points back to the contact page
  const nextInput = page.locator('input[name="_next"]');
  await expect(nextInput).toHaveValue(/\/contact\?sent=1$/);
});

test('contact form shows a thanks banner after redirect back', async ({ page }) => {
  // Banner hidden on a normal visit
  await page.goto('/contact');
  await expect(page.locator('#form-success')).toBeHidden();

  // Banner shown when Formspree redirects back with ?sent=1
  await page.goto('/contact?sent=1');
  await expect(page.locator('#form-success')).toBeVisible();
  await expect(page.locator('#form-success')).toContainText('message sent');
});
