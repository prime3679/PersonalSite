import { test, expect, devices } from '@playwright/test';

const HOMEPAGE_HINT_COPY = 'tap anywhere to switch the light';
const HOMEPAGE_HINT_KEY = 'homepage-theme-hint-seen';

// installed clocks keep ticking in real time, which makes 1ms boundary
// assertions racy. pausing before navigation freezes fake time at a known
// zero so the hint's timers register at exactly CLOCK_START.
const CLOCK_START = new Date('2026-01-01T00:00:00Z');

async function installPausedClock(page: import('@playwright/test').Page) {
  await page.clock.install({ time: CLOCK_START });
  await page.clock.pauseAt(CLOCK_START);
}

async function blockAnalytics(page: import('@playwright/test').Page) {
  await page.route('https://cloud.umami.is/**', (route) => route.abort());
}

const storedHintFlag = (page: import('@playwright/test').Page) =>
  page.evaluate((key) => localStorage.getItem(key), HOMEPAGE_HINT_KEY);

const hasDarkTheme = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.classList.contains('dark'));

const awaitFrame = (page: import('@playwright/test').Page) =>
  page.evaluate(() => new Promise(requestAnimationFrame));

const scrollFullyPastMasthead = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const masthead = document.querySelector('.masthead');
    if (!masthead) throw new Error('masthead not found');
    const bottom = masthead.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo(0, bottom + 24);
  });

test.describe('homepage first-visit theme hint', () => {
  test.beforeEach(async ({ page }) => {
    await blockAnalytics(page);
  });

  test('keeps the folio-band hint unrevealed at load and reveals it about 1.5 seconds later', async ({ page }) => {
    await installPausedClock(page);
    await page.goto('/');

    const hint = page.locator('[data-home-theme-hint]');
    await expect(page.locator('.masthead__folio-block .folio + [data-home-theme-hint]')).toHaveCount(1);
    await expect(hint).toHaveText(HOMEPAGE_HINT_COPY);
    await expect(hint).toBeHidden();

    await page.clock.fastForward(1_499);
    await expect(hint).toBeHidden();
    expect(await storedHintFlag(page)).toBe(null);

    await page.clock.fastForward(2);
    await page.clock.runFor(16);
    await expect(hint).toBeVisible();
    await expect(hint).toHaveAttribute('data-state', 'visible');
    await page.clock.runFor(220);
    await expect(hint).toHaveCSS('opacity', '1');
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

  test('holds until just before the 20-second maximum and auto-dismisses just after it', async ({ page }) => {
    await installPausedClock(page);
    await page.goto('/');

    const hint = page.locator('[data-home-theme-hint]');
    await page.clock.fastForward(1_501);
    await expect(hint).toBeVisible();
    expect(await storedHintFlag(page)).toBe(null);

    await page.clock.fastForward(18_498);
    await expect(hint).toBeVisible();
    expect(await storedHintFlag(page)).toBe(null);

    await page.clock.fastForward(2);
    await page.clock.runFor(400);

    await expect(hint).toBeHidden();
    await expect.poll(() => storedHintFlag(page)).toBe('true');

    await page.reload();
    await expect(hint).toBeHidden();
  });

  test('dismisses without toggling the theme when the visitor scrolls fully past the masthead', async ({ page }) => {
    await page.goto('/');

    const hint = page.locator('[data-home-theme-hint]');
    await expect(hint).toBeVisible();

    await page.evaluate(() => window.scrollBy(0, 60));
    await awaitFrame(page);
    expect(await storedHintFlag(page)).toBe(null);
    await expect(hint).toBeVisible();

    await scrollFullyPastMasthead(page);

    await expect(hint).toBeHidden();
    await expect.poll(() => storedHintFlag(page)).toBe('true');
    expect(await hasDarkTheme(page)).toBe(false);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(hint).toBeHidden();

    await page.reload();
    await expect(hint).toBeHidden();
  });

  test('dismisses and persists when the visitor is already fully past the masthead before load-time arming', async ({ page }) => {
    await installPausedClock(page);

    // hold the load event open with a stalled image injected at DOMContentLoaded:
    // the hint script (a module) has already run by then, but the load-time arm
    // path has not.
    let releaseLoad = () => {};
    const loadHeld = new Promise<void>((resolve) => {
      releaseLoad = resolve;
    });
    await page.route('**/__hold-load__', async (route) => {
      await loadHeld;
      await route.fulfill({
        status: 200,
        contentType: 'image/gif',
        body: Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      });
    });
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const img = document.createElement('img');
        img.src = '/__hold-load__';
        img.hidden = true;
        document.body.appendChild(img);
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(await page.evaluate(() => document.readyState)).not.toBe('complete');

    // Freeze the observed geometry beyond the threshold without dispatching a
    // scroll event. A listener installed only during load-time arming therefore
    // cannot mistake a later browser-generated scroll event for this crossing.
    await page.evaluate(() => {
      const masthead = document.querySelector('.masthead');
      if (!masthead) throw new Error('masthead not found');
      const rect = masthead.getBoundingClientRect();
      masthead.getBoundingClientRect = () =>
        new DOMRect(rect.x, -rect.height - 1, rect.width, rect.height);
    });
    expect(await page.locator('.masthead').evaluate((element) => element.getBoundingClientRect().bottom)).toBeLessThan(0);
    expect(await page.evaluate(() => document.readyState)).not.toBe('complete');
    releaseLoad();
    await page.waitForLoadState('load');

    const hint = page.locator('[data-home-theme-hint]');
    await expect.poll(() => storedHintFlag(page)).toBe('true');
    await expect(hint).toBeHidden();
    expect(await hasDarkTheme(page)).toBe(false);

    await page.clock.fastForward(2_000);
    await expect(hint).toBeHidden();

    await page.clock.fastForward(18_500);
    await page.clock.runFor(400);
    await expect(hint).toBeHidden();
  });

  test('a reveal frame still pending at dismissal cannot flash the hint back to visible', async ({ page }) => {
    await installPausedClock(page);
    await page.goto('/');

    const hint = page.locator('[data-home-theme-hint]');
    await page.evaluate(() => {
      const queuedFrames = new Map<number, FrameRequestCallback>();
      let nextFrameId = 10_000;

      window.requestAnimationFrame = (callback) => {
        const id = nextFrameId++;
        queuedFrames.set(id, callback);
        return id;
      };
      window.cancelAnimationFrame = (id) => {
        queuedFrames.delete(id);
      };
      (window as typeof window & {
        __themeHintFrameTest__: { flush: () => void; pending: () => number };
      }).__themeHintFrameTest__ = {
        pending: () => queuedFrames.size,
        flush: () => {
          const callbacks = [...queuedFrames.values()];
          queuedFrames.clear();
          for (const callback of callbacks) callback(performance.now());
        },
      };
    });
    await page.clock.fastForward(1_500);

    // The reveal timer has fired, but the controlled frame queue keeps its
    // state mutation pending until after the synchronous theme change.
    await expect(hint).toBeVisible();
    await expect(hint).toHaveAttribute('data-state', 'hidden');
    expect(
      await page.evaluate(() =>
        (window as typeof window & { __themeHintFrameTest__: { pending: () => number } })
          .__themeHintFrameTest__.pending(),
      ),
    ).toBeGreaterThan(0);

    await page.evaluate(() => {
      const button = document.querySelector<HTMLButtonElement>('header [data-theme-toggle]');
      if (!button) throw new Error('theme toggle not found');
      button.click();
    });
    expect(await hasDarkTheme(page)).toBe(true);
    await expect.poll(() => storedHintFlag(page)).toBe('true');
    await expect(hint).toHaveAttribute('data-state', 'hidden');

    await page.evaluate(() =>
      (window as typeof window & { __themeHintFrameTest__: { flush: () => void } })
        .__themeHintFrameTest__.flush(),
    );
    await expect(hint).toHaveAttribute('data-state', 'hidden');

    await page.clock.runFor(200);
    await expect(hint).toBeHidden();
  });

  test('does not dismiss or persist when a protected interactive element is clicked', async ({ page }) => {
    await page.goto('/');

    const hint = page.locator('[data-home-theme-hint]');
    await expect(hint).toBeVisible();

    const workLink = page.locator('.record__link');
    await workLink.evaluate((link) => link.setAttribute('href', '#work-test'));

    await workLink.click();
    await awaitFrame(page);

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

  test('stays homepage-only', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.locator('[data-home-theme-hint]')).toHaveCount(0);
  });

  test.describe('mobile webkit startup', () => {
    // iPhone 13 equivalent: webkit engine, 390x664 viewport, isMobile, hasTouch.
    // The engine comes from the webkit project (test.use cannot switch browsers
    // inside a describe), so other projects skip. Real clock on purpose: the
    // startup race only shows up against genuine load-event timing, which
    // page.clock.install() would paper over.
    const { defaultBrowserType: _engine, ...iPhone13 } = devices['iPhone 13'];
    test.use(iPhone13);
    test.skip(({ browserName }) => browserName !== 'webkit', 'mobile WebKit startup-race regression');

    test('arms and reveals the delayed hint on a first mobile visit', async ({ page, browserName, isMobile, hasTouch }) => {
      expect(browserName).toBe('webkit');
      expect(isMobile).toBe(true);
      expect(hasTouch).toBe(true);
      expect(page.viewportSize()).toEqual({ width: 390, height: 664 });

      await page.goto('/');

      const hint = page.locator('[data-home-theme-hint]');
      await expect(hint).toBeVisible({ timeout: 5_000 });
      expect(await storedHintFlag(page)).toBe(null);
    });
  });
});
