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

function relativeLuminance(rgb: string) {
  const [r, g, b] = rgb.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string) {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// the ink and the paper the record actually sits on, read the moment the
// document is parsed rather than after any animation could have settled
async function firstPaintInk(page: Page) {
  return page.evaluate(() => {
    const record = document.querySelector('main .record')!;
    const style = window.getComputedStyle(record);
    return {
      ink: style.color,
      opacity: Number(style.opacity),
      animation: style.animationName,
      paper: window.getComputedStyle(document.documentElement).backgroundColor,
      dark: document.documentElement.classList.contains('dark'),
    };
  });
}

test('the record is the whole homepage: no header, toggle, hamburger, or site footer', async ({ page }) => {
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');

    await expect(page.locator('header.site-header')).toHaveCount(0);
    await expect(page.locator('[data-theme-toggle]')).toHaveCount(0);
    await expect(page.locator('#menu-toggle, #mobile-nav')).toHaveCount(0);
    await expect(page.locator('footer')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('adrian lumley · nyc');
    await expect(page.locator('body')).not.toContainText('night shift');

    // nothing renders before main except the skip link, and the lede is the
    // first line of main
    const shape = await page.evaluate(() => ({
      before: Array.from(document.body.children)
        .slice(0, Array.from(document.body.children).findIndex((el) => el.tagName === 'MAIN'))
        .map((el) => `${el.tagName.toLowerCase()}${el.getAttribute('href') ?? ''}`),
      firstLine: document.querySelector('main')!.innerText.trim().split('\n')[0],
    }));
    expect(shape.before).toEqual(['a#main']);
    expect(shape.firstLine).toBe(LEDE);
    await expect(page.locator('main#main')).toHaveCount(1);
  }
});

test('homepage ink is dark on light paper from the first paint', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const paint = await firstPaintInk(page);
  expect(paint.dark).toBe(false);
  expect(paint.opacity).toBe(1);
  expect(paint.animation).toBe('none');
  expect(relativeLuminance(paint.ink)).toBeLessThan(relativeLuminance(paint.paper));
  expect(contrastRatio(paint.ink, paint.paper)).toBeGreaterThan(12);

  // every link on the record is the same dark ink
  const ink = await inkColor(page);
  expect(ink).toBe(paint.ink);
});

test('night shift on the homepage remaps paper with ink; it never leaks light ink onto light ground', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const paint = await firstPaintInk(page);
  expect(paint.dark).toBe(true);
  expect(paint.opacity).toBe(1);
  expect(relativeLuminance(paint.ink)).toBeGreaterThan(relativeLuminance(paint.paper));
  expect(contrastRatio(paint.ink, paint.paper)).toBeGreaterThan(12);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#16130e');

  // a stored light preference wins over the system scheme
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const light = await firstPaintInk(page);
  expect(light.dark).toBe(false);
  expect(relativeLuminance(light.ink)).toBeLessThan(relativeLuminance(light.paper));
  expect(contrastRatio(light.ink, light.paper)).toBeGreaterThan(12);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f7f3ea');
});

test('homepage first screen sells the latest essay under the lede', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  const record = page.locator('main .record');
  await expect(page.locator('main h1')).toHaveText(LEDE);

  const feature = page.locator('[data-record-feature]');
  const featureLink = feature.getByRole('link', { name: 'The honest record' });
  // page links carry the canonical trailing slash so the click is one request
  await expect(featureLink).toHaveAttribute('href', '/writing/the-honest-record/');
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
  await expect(record.locator('.record__rows a[href^="/writing/the-honest-record"]')).toHaveCount(0);
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
  await expect(writing.getByRole('link', { name: 'Does Claude train on your email?' })).toHaveAttribute('href', '/writing/claude-gmail-connector-data/');
  await expect(writing.getByRole('link', { name: 'Your meetings are a budget line' })).toHaveAttribute('href', '/writing/meeting-cost/');

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
  await expect(footer.getByRole('link', { name: 'email' })).toHaveAttribute('href', '/contact/');
  await expect(footer.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/adrianlumley/');
  await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/prime3679');
  await expect(footer.getByRole('link', { name: 'a short record' })).toHaveAttribute('href', '/work/');

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

  // the homepage carries no header or footer, so read the chrome link
  // style from an inner page, skipping the current-page rule on its own tab
  await page.goto('/work/');
  const navLink = await linkStyle(page.locator('[data-header-desktop-nav] a[href="/lab/"]'));
  const footerLink = await linkStyle(page.locator('footer nav a[href="/lab/"]'));

  await page.goto('/writing/the-honest-record/');
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
  // chrome links share the record's family; essay prose is the serif reading face
  for (const style of [navLink, footerLink, labLink]) {
    expect(style.fontFamily).toBe(homeLink.fontFamily);
  }
});

// the record does not stop at the homepage: connected pages are set in the
// same sans, at the same body size, in the same ink, with the page title as
// the one size jump and italic reserved for labels. essays read in the serif
// (writing.spec) and the signal room is the instrument (signal-room.spec);
// those two languages have their own specs.
for (const path of ['/writing/', '/about/', '/work/', '/lab/', '/contact/']) {
  test(`${path} is set in the record's type system`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const home = await page.locator('main .record').evaluate((node) => {
      const style = window.getComputedStyle(node);
      return { family: style.fontFamily, size: style.fontSize, color: style.color };
    });
    const featureSize = await page.locator('[data-record-feature] h2').evaluate((node) => window.getComputedStyle(node).fontSize);

    await page.goto(path);
    const measured = await page.evaluate(() => {
      const families = new Set<string>();
      const sizes = new Map<string, string[]>();
      const colors = new Set<string>();
      const italics: string[] = [];
      const transforms: string[] = [];
      const animated: string[] = [];
      const nodes = document.querySelectorAll<HTMLElement>('header, main, footer, header *, main *, footer *');
      for (const el of nodes) {
        const ownText = Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        if (style.animationName !== 'none' || Number(style.opacity) < 1) animated.push(el.tagName.toLowerCase());
        // controls (night shift, tag chips) are not text; they carry their own size
        if (!ownText || el.tagName === 'BUTTON') continue;
        const text = (el.textContent ?? '').trim().slice(0, 40);
        families.add(style.fontFamily.split(',')[0]);
        sizes.set(style.fontSize, [...(sizes.get(style.fontSize) ?? []), text]);
        colors.add(style.color);
        // inline emphasis inside an essay is content; italic outside prose is a label
        if (style.fontStyle === 'italic' && !el.closest('.prose')) italics.push(text);
        if (style.textTransform === 'uppercase') transforms.push(text);
      }
      return {
        families: [...families],
        sizes: Object.fromEntries(sizes),
        colors: [...colors],
        italics,
        transforms,
        animated,
        h1Size: window.getComputedStyle(document.querySelector('main h1')!).fontSize,
        gradient: window.getComputedStyle(document.body).backgroundImage,
      };
    });

    expect(measured.families).toEqual([home.family.split(',')[0]]);
    expect(measured.colors).toEqual([home.color]);
    expect(measured.h1Size).toBe(featureSize);
    // body size everywhere and the title once
    const sizeKeys = Object.keys(measured.sizes).sort();
    expect(sizeKeys).toEqual([home.size, featureSize].sort());
    expect(measured.sizes[featureSize]).toHaveLength(1);
    expect(measured.transforms).toEqual([]);
    expect(measured.animated).toEqual([]);
    expect(measured.gradient).toBe('none');
    // italic is for labels: short, no sentence punctuation, never a link
    for (const label of measured.italics) {
      expect(label.length).toBeLessThan(40);
      expect(label).not.toMatch(/[.!?]$/);
    }
    const italicLinks = await page.locator('main a').evaluateAll((links) => links.filter((a) => window.getComputedStyle(a).fontStyle === 'italic').length);
    expect(italicLinks).toBe(0);
  });
}
