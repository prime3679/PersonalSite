import { test, expect, type Locator, type Page } from '@playwright/test';

const LEDE = 'Adrian Lumley is a product director in New York City.';
const DEK = 'People lie in journals. They perform in therapy. Nobody performs for a coding agent.';

async function linkStyle(link: Locator) {
  return link.evaluate((node) => {
    const style = window.getComputedStyle(node);
    return {
      color: style.color,
      decorationLine: style.textDecorationLine,
      decorationColor: style.textDecorationColor,
      thickness: style.textDecorationThickness,
      fontStyle: style.fontStyle,
      fontFamily: style.fontFamily,
      fontWeight: Number(style.fontWeight),
      fontSize: Number.parseFloat(style.fontSize),
    };
  });
}

async function inkColor(page: Page) {
  return page.locator('main .record').evaluate((node) => window.getComputedStyle(node).color);
}

test('homepage first screen sells the latest essay under the lede', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  const record = page.locator('main .record');
  await expect(page.locator('main h1')).toHaveText(LEDE);

  const feature = page.locator('[data-record-feature]');
  const featureLink = feature.getByRole('link', { name: 'The honest record' });
  await expect(featureLink).toHaveAttribute('href', '/writing/the-honest-record');
  await expect(feature.locator('time')).toHaveText('July 2026');
  await expect(feature.locator('time')).toHaveCSS('font-style', 'normal');
  await expect(feature.locator('.record__feature-dek')).toHaveText(DEK);
  await expect(feature.locator('.record__feature-dek a')).toHaveCount(0);

  // the featured essay is fully inside the first viewport
  const featureBox = await feature.boundingBox();
  expect(featureBox).not.toBeNull();
  expect(featureBox!.y + featureBox!.height).toBeLessThan(800);

  // the single size jump: ~1.5x body, same family, weight 400
  const bodySize = await record.evaluate((node) => Number.parseFloat(window.getComputedStyle(node).fontSize));
  const title = await linkStyle(featureLink);
  expect(title.fontSize / bodySize).toBeGreaterThan(1.4);
  expect(title.fontSize / bodySize).toBeLessThan(1.6);
  expect(title.fontWeight).toBe(400);
  expect(title.fontFamily).toContain('Geist');
  expect(title.fontFamily).not.toContain('Newsreader');

  // nothing else on the record changes size
  const sizes = await record.evaluate((node) => {
    const seen = new Set<string>();
    for (const el of node.querySelectorAll<HTMLElement>('*')) {
      if (el.closest('[data-record-feature] h2')) continue;
      seen.add(window.getComputedStyle(el).fontSize);
    }
    return [...seen];
  });
  expect(sizes).toEqual([`${bodySize}px`]);

  // the featured essay is not duplicated in the archive
  await expect(record.locator('.record__rows a[href="/writing/the-honest-record"]')).toHaveCount(0);
});

test('homepage links share one ink and one hairline underline; labels alone are italic', async ({ page }) => {
  await page.goto('/');

  const ink = await inkColor(page);
  const links = page.locator('main .record a');
  const count = await links.count();
  expect(count).toBeGreaterThan(5);

  for (let i = 0; i < count; i += 1) {
    const style = await linkStyle(links.nth(i));
    expect(style.color).toBe(ink);
    expect(style.decorationLine).toBe('underline');
    expect(style.decorationColor).toBe(ink);
    expect(style.thickness).toBe('1px');
    expect(style.fontStyle).toBe('normal');
  }

  // bare text: lede, dek, dates carry no underline
  for (const selector of ['main h1', '.record__feature-dek', '.record__feature-date', '.record__row time', '.record__ledger dd']) {
    const nodes = page.locator(selector);
    const n = await nodes.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i += 1) {
      await expect(nodes.nth(i)).toHaveCSS('text-decoration-line', 'none');
    }
  }

  // italic only on the section labels
  const italics = await page.locator('main .record *').evaluateAll((nodes) =>
    nodes
      .filter((node) => window.getComputedStyle(node).fontStyle === 'italic')
      .map((node) => node.textContent?.trim()),
  );
  expect(italics.sort()).toEqual(['currently', 'lab', 'past', 'writing']);

  // hover shifts nothing
  const first = links.first();
  const before = await linkStyle(first);
  await first.hover();
  const after = await linkStyle(first);
  expect(after.color).toBe(before.color);
  expect(after.decorationLine).toBe('underline');
});

test('homepage ledger, archive, lab rows, and footer are reconciled', async ({ page }) => {
  await page.goto('/');
  const main = page.locator('main');

  // ledger
  const ledger = page.locator('.record__ledger');
  await expect(ledger.locator('dt')).toHaveText(['currently', 'past']);
  await expect(ledger.locator('dd')).toHaveText(['Salesforce.', 'SiriusXM, Disney+, EA.']);
  await expect(main).not.toContainText('director of product');
  await expect(main).not.toContainText('diligence');
  await expect(main).not.toContainText('case studies');

  // label column hugs its content: max-content, not a fractional hole
  const columns = await page.locator('main .record').evaluate((node) => {
    const grid = window.getComputedStyle(node).gridTemplateColumns.split(' ').map(Number.parseFloat);
    // measure the glyphs, not the stretched grid cell
    const widest = Math.max(
      ...Array.from(node.querySelectorAll<HTMLElement>('.record__label, .record__row time')).map((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect().width;
      }),
    );
    return { labelColumn: grid[0], widest };
  });
  expect(columns.labelColumn).toBeGreaterThanOrEqual(columns.widest - 0.5);
  expect(columns.labelColumn).toBeLessThan(columns.widest + 8);

  // writing archive: two dated rows, real posts, short titles
  const writing = page.getByRole('region', { name: 'writing' });
  await expect(writing.locator('.record__row time')).toHaveText(['June 2026', 'March 2026']);
  await expect(writing.getByRole('link', { name: 'Does Claude train on your email?' })).toHaveAttribute('href', '/writing/claude-gmail-connector-data');
  await expect(writing.getByRole('link', { name: 'Your meetings are a budget line' })).toHaveAttribute('href', '/writing/meeting-cost');

  // lab: sentence case, existing hrefs, no dates, same two-column rhythm
  const lab = page.getByRole('region', { name: 'lab' });
  await expect(lab.locator('time')).toHaveCount(0);
  await expect(lab.getByRole('link', { name: 'Meeting cost' })).toHaveAttribute('href', '/lab/meeting-cost/');
  await expect(lab.getByRole('link', { name: 'Iron log' })).toHaveAttribute('href', '/lab/iron-log/');
  await expect(lab.getByRole('link', { name: 'Ink field' })).toHaveAttribute('href', '/lab/ink-field/');
  const writingTitleX = (await writing.locator('.record__row a').first().boundingBox())!.x;
  const labTitleX = (await lab.locator('.record__row a').first().boundingBox())!.x;
  expect(Math.abs(writingTitleX - labTitleX)).toBeLessThan(1);

  // footer: one line, commas, four text links
  const footer = page.locator('.record__footer');
  await expect(footer).toHaveText('email, LinkedIn, GitHub, a short record');
  await expect(footer.getByRole('link', { name: 'email' })).toHaveAttribute('href', '/contact');
  await expect(footer.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/adrianlumley/');
  await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/prime3679');
  await expect(footer.getByRole('link', { name: 'a short record' })).toHaveAttribute('href', '/work');

  // no pitch, no instrument, no numbered rails
  await expect(main).not.toContainText("let's talk");
  await expect(main).not.toContainText('earn its adoption');
  await expect(main.locator('[data-signal-trace], [data-live-status], .instrument-panel')).toHaveCount(0);
  await expect(main).not.toContainText(/\b0[1-4]\b/);
  await expect(main.locator('img')).toHaveCount(0);
});

test('the homepage link style is the site link style', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const homeLink = await linkStyle(page.locator('.record__rows a').first());
  const navLink = await linkStyle(page.locator('[data-header-desktop-nav] a').first());
  const footerLink = await linkStyle(page.locator('footer nav a').first());

  await page.goto('/writing/the-honest-record');
  const proseLink = page.locator('main .prose a').first();
  const essayLink = (await proseLink.count()) ? await linkStyle(proseLink) : await linkStyle(page.locator('main a').first());

  await page.goto('/lab/');
  const labLink = await linkStyle(page.locator('main a').first());

  for (const style of [navLink, footerLink, essayLink, labLink]) {
    expect(style.color).toBe(homeLink.color);
    expect(style.decorationLine).toBe('underline');
    expect(style.decorationColor).toBe(homeLink.decorationColor);
    expect(style.thickness).toBe(homeLink.thickness);
  }
});
