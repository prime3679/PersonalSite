import { test, expect } from '@playwright/test';

const HOMEPAGE_HINT_COPY = 'tap anywhere to switch the light';
const HOMEPAGE_HINT_KEY = 'homepage-theme-hint-seen';

async function blockAnalytics(page: import('@playwright/test').Page) {
  await page.route('https://cloud.umami.is/**', (route) => route.abort());
}

const storedHintFlag = (page: import('@playwright/test').Page) =>
  page.evaluate((key) => localStorage.getItem(key), HOMEPAGE_HINT_KEY);

const hasDarkTheme = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.classList.contains('dark'));

test.describe('homepage first-visit theme hint', () => {
  test.beforeEach(async ({ page }) => {
    await blockAnalytics(page);
  });

  test('shows the exact hint beneath the folio rule and announces it politely without focus theft', async ({ page }) => {
    await page.goto('/');

    const hint = page.locator('[data-home-theme-hint]');
    await expect(page.locator('.masthead__folio-block .folio + [data-home-theme-hint]')).toHaveCount(1);
    await expect(hint).toHaveText(HOMEPAGE_HINT_COPY);
    await expect(hint).toBeVisible();
    await expect(hint).toHaveAttribute('aria-live', 'polite');
    await expect(hint).toHaveAttribute('aria-atomic', 'true');
    await expect(hint).not.toBeFocused();

    const hintStyles = await hint.evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return {
        fontFamily: styles.fontFamily,
        transitionDuration: styles.transitionDuration,
      };
    });

    expect(hintStyles.fontFamily).toContain('Geist Mono');
    expect(hintStyles.transitionDuration).not.toBe('0s');
  });

  test('dismisses after the first successful theme toggle, sets its seen flag, and stays gone on reload', async ({ page }) => {
    await page.goto('/');

    const hint = page.locator('[data-home-theme-hint]');
    await expect(hint).toBeVisible();

    await page.locator('header [data-theme-toggle]').click();

    expect(await hasDarkTheme(page)).toBe(true);
    await expect(hint).toBeHidden();
    await expect.poll(() => storedHintFlag(page)).toBe('true');

    await page.reload();

    await expect(hint).toBeHidden();
    await expect.poll(() => storedHintFlag(page)).toBe('true');
  });

  test('auto-dismisses after the first-visit window, sets its seen flag, and stays gone', async ({ page }) => {
    test.setTimeout(15_000);
    await page.goto('/');

    const hint = page.locator('[data-home-theme-hint]');
    await expect(hint).toBeVisible();

    await page.waitForTimeout(8_300);

    await expect(hint).toBeHidden();
    await expect.poll(() => storedHintFlag(page)).toBe('true');

    await page.reload();
    await expect(hint).toBeHidden();
  });

  test('does not dismiss or persist when a protected interactive element is clicked', async ({ page }) => {
    await page.goto('/');

    const hint = page.locator('[data-home-theme-hint]');
    const workLink = page.locator('.record__link');
    await workLink.evaluate((link) => link.setAttribute('href', '#work-test'));

    await workLink.click();

    expect(await hasDarkTheme(page)).toBe(false);
    expect(await storedHintFlag(page)).toBe(null);
    await expect(hint).toBeVisible();
  });

  test('shows without fade for reduced-motion visitors and keeps the same polite announcement contract', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const hint = page.locator('[data-home-theme-hint]');
    await expect(hint).toBeVisible();
    await expect(hint).toHaveText(HOMEPAGE_HINT_COPY);
    await expect(hint).toHaveAttribute('aria-live', 'polite');
    await expect(hint).toHaveAttribute('aria-atomic', 'true');
    await expect(hint).not.toBeFocused();

    const transitionDuration = await hint.evaluate((element) =>
      Number.parseFloat(window.getComputedStyle(element).transitionDuration),
    );
    expect(transitionDuration).toBeLessThanOrEqual(0.001);
  });
});
