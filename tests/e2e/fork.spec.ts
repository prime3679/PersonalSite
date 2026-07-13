import { expect, test, type Page } from '@playwright/test';
import { promises as fs } from 'node:fs';

async function setRange(locator: ReturnType<Page['locator']>, value: number) {
  await locator.evaluate((node, nextValue) => {
    const input = node as HTMLInputElement;
    input.value = String(nextValue);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

async function completeFork(page: Page) {
  await page.goto('/lab/fork/');
  await page.getByRole('button', { name: 'draw the fork' }).click();
  await page.getByPlaceholder('leave the job, stay in the city, say it out loud').fill('choose the next chapter');
  await page.getByRole('button', { name: 'next' }).click();

  await page.getByPlaceholder('stay put').fill('stay put');
  await page.getByPlaceholder('take the offer').fill('take offer');
  await page.getByPlaceholder('start over').fill('start over');
  await page.getByRole('button', { name: 'next' }).click();

  const marks = [
    { pull: 92, sting: 12, reversibility: 'ink. it writes over the rest.' },
    { pull: 24, sting: 94, reversibility: 'pencil. i could walk it back.' },
    { pull: 58, sting: 52, reversibility: 'pencil. i could walk it back.' },
  ];

  for (const [index, mark] of marks.entries()) {
    await setRange(page.locator('input[type="range"]').nth(0), mark.pull);
    await setRange(page.locator('input[type="range"]').nth(1), mark.sting);
    await page.getByLabel(mark.reversibility).check();
    await page.getByRole('button', { name: index === 2 ? 'draw the map' : 'next' }).click();
  }
}

test('fork completes the full flow and draws the required map', async ({ page }) => {
  await completeFork(page);

  await expect(page).toHaveTitle('fork | a regret map for one hard decision');
  await expect(page.getByRole('heading', { name: 'choose the next chapter' })).toBeVisible();
  await expect(page.getByRole('img', { name: /fork map for choose the next chapter/ })).toBeVisible();
  await expect(page.locator('.map-branch')).toHaveCount(3);
  await expect(page.locator('.crossing-mark')).toHaveCount(1);
  await expect(page.locator('.map-branch').nth(0)).toHaveAttribute('stroke-width', '2.5');
  await expect(page.locator('.map-branch').nth(1)).toHaveAttribute('stroke-width', '1.5');
  await expect(page.locator('main')).toContainText('stay put pulls hardest today. take offer would sting most to lose at ten years. those are two different futures.');
  await expect(page.locator('main')).toContainText('one question the map cannot hold: which of these doors is closing on its own, whether or not you choose?');

  const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem('fork.v1') || '{}'));
  expect(stored.step).toBe('map');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('fork is keyboard completable with native sliders and radios', async ({ page }) => {
  await page.goto('/lab/fork/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.type('one consequential choice');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.keyboard.type('stay put');
  await page.keyboard.press('Tab');
  await page.keyboard.type('take offer');
  await page.keyboard.press('Tab');
  await page.keyboard.type('start over');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');

  for (let index = 0; index < 3; index += 1) {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
  }

  await expect(page.getByRole('img', { name: /fork map for one consequential choice/ })).toBeVisible();
});

for (const width of [320, 390, 414]) {
  test(`fork uses the compact portrait map at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 720 });
    await completeFork(page);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(width);

    const map = page.locator('.fork-map');
    await expect(map).toHaveAttribute('viewBox', '0 0 320 420');
    await expect(map).toHaveAttribute('width', '320');
    await expect(map).toHaveAttribute('height', '420');

    const mapBox = await map.boundingBox();
    expect(mapBox).not.toBeNull();
    expect(mapBox!.height).toBeGreaterThanOrEqual(330);
    expect(mapBox!.width).toBeLessThanOrEqual(width);

    const branchLabelHeight = await page.locator('.branch-label').first().evaluate((node) => node.getBoundingClientRect().height);
    expect(branchLabelHeight).toBeGreaterThanOrEqual(9);

    for (const button of await page.getByRole('button').all()) {
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });
}

test('fork moves focus to the map heading and exposes rich map summary text', async ({ page }) => {
  await completeFork(page);

  await expect(page.getByRole('heading', { name: 'choose the next chapter' })).toBeFocused();
  await expect(page.locator('.sr-only li').nth(0)).toContainText('stay put, pulls hard today, barely stings at ten years, ink.');
  await expect(page.locator('.sr-only li').nth(1)).toContainText('take offer, pulls lightly today, stings like a scar at ten years, pencil.');
});

test('fork associates validation hints with the fields that need them', async ({ page }) => {
  await page.goto('/lab/fork/');
  await page.getByRole('button', { name: 'draw the fork' }).click();
  await page.getByRole('button', { name: 'next' }).click();

  const decision = page.getByPlaceholder('leave the job, stay in the city, say it out loud');
  await expect(decision).toHaveAttribute('aria-describedby', 'decision-hint');
  await expect(page.locator('#decision-hint')).toBeVisible();

  await decision.fill('choose the next chapter');
  await page.getByRole('button', { name: 'next' }).click();
  await page.getByRole('button', { name: 'next' }).click();
  await expect(page.getByPlaceholder('stay put')).toHaveAttribute('aria-describedby', 'futures-hint');
  await expect(page.locator('#futures-hint')).toBeVisible();
});

test('fork announces slider values as they change and restores marked sliders', async ({ page }) => {
  await page.goto('/lab/fork/');
  await page.getByRole('button', { name: 'draw the fork' }).click();
  await page.getByPlaceholder('leave the job, stay in the city, say it out loud').fill('choose the next chapter');
  await page.getByRole('button', { name: 'next' }).click();
  await page.getByPlaceholder('stay put').fill('stay put');
  await page.getByPlaceholder('take the offer').fill('take offer');
  await page.getByPlaceholder('start over').fill('start over');
  await page.getByRole('button', { name: 'next' }).click();

  const pull = page.locator('input[type="range"]').first();
  await expect(pull).toHaveAttribute('aria-valuetext', 'about 5 of 10, from barely to hard');
  await setRange(pull, 72);
  await expect(pull).toHaveAttribute('aria-valuetext', 'about 7 of 10, from barely to hard');
  await page.reload();
  await expect(page.locator('input[type="range"]').first()).toHaveAttribute('aria-valuetext', 'about 7 of 10, from barely to hard');
});

test('fork downloads a legible 1080 by 1350 png', async ({ page }, testInfo) => {
  await completeFork(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'save the map' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('fork-map.png');

  const filePath = testInfo.outputPath('fork-map.png');
  await download.saveAs(filePath);
  const buffer = await fs.readFile(filePath);
  expect(buffer.subarray(1, 4).toString('ascii')).toBe('PNG');
  expect(buffer.readUInt32BE(16)).toBe(1080);
  expect(buffer.readUInt32BE(20)).toBe(1350);
});

test('fork only requests same-origin html and script', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  await completeFork(page);
  await page.getByRole('button', { name: 'save the map' }).click();

  const urls = requests.filter((url) => url.startsWith('http'));
  expect(urls.length).toBeGreaterThanOrEqual(2);
  for (const url of urls) {
    const parsed = new URL(url);
    expect(parsed.origin).toBe('http://localhost:4321');
  }
  expect(urls.map((url) => new URL(url).pathname).sort()).toEqual(['/lab/fork/', '/lab/fork/fork-logic.js']);
});

test('fork renders reduced motion immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await completeFork(page);

  const animationCount = await page.locator('.map-branch').first().evaluate((node) => node.getAnimations().length);
  expect(animationCount).toBe(0);
  await expect(page.locator('.map-branch').first()).toHaveCSS('stroke-dashoffset', '0px');
});

test('fork start over is confirmed and removes session state', async ({ page }) => {
  await completeFork(page);
  await page.getByRole('button', { name: 'start over' }).click();
  await expect(page.getByRole('button', { name: 'this erases everything. start over.' })).toBeFocused();
  expect(await page.evaluate(() => sessionStorage.getItem('fork.v1'))).not.toBeNull();

  await page.getByRole('button', { name: 'this erases everything. start over.' }).click();
  await expect(page.getByRole('heading', { name: 'fork' })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('fork.v1'))).toBeNull();
});
