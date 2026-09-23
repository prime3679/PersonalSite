import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

const widths = [320, 375, 390, 414];
const failures = [];
const port = Number(process.env.MOBILE_VERIFIER_PORT || 4329);
const baseUrl = process.env.MOBILE_VERIFIER_URL || `http://127.0.0.1:${port}`;
let server;

async function waitForServer(url, timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`preview server did not become ready at ${url}`);
}

if (!process.env.MOBILE_VERIFIER_URL) {
  server = spawn('npx', ['astro', 'preview', '--host', '127.0.0.1', '--port', String(port)], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await waitForServer(baseUrl);
}

// wcag relative luminance and contrast, so the verifier catches ink that is
// technically present but unreadable against the paper
function luminance(rgb) {
  const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// the homepage is the record: no header and no site footer. the header is
// verified on an inner page below.
const navPath = '/writing/';

const browser = await chromium.launch();
try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, isMobile: true, deviceScaleFactor: 2 });

    // first paint: read the record before any animation could settle
    await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded' });
    const paint = await page.evaluate(() => {
      const record = document.querySelector('[data-record]');
      if (!record) return null;
      const style = getComputedStyle(record);
      return {
        ink: style.color,
        opacity: Number(style.opacity),
        animation: style.animationName,
        paper: getComputedStyle(document.documentElement).backgroundColor,
      };
    });
    if (!paint) failures.push(`${width}: record missing`);
    else {
      if (paint.opacity !== 1) failures.push(`${width}: record paints at opacity ${paint.opacity}`);
      if (paint.animation !== 'none') failures.push(`${width}: record animates in (${paint.animation})`);
      if (luminance(paint.ink) >= luminance(paint.paper)) failures.push(`${width}: light ink ${paint.ink} on light paper ${paint.paper}`);
      const ratio = contrast(paint.ink, paint.paper);
      if (ratio < 7) failures.push(`${width}: ink contrast ${ratio.toFixed(2)} below 7:1`);
    }

    await page.waitForLoadState('networkidle');
    const closed = await page.evaluate(() => {
      const bodyText = document.body.innerText.toLowerCase();
      const record = document.querySelector('[data-record]');
      const hero = document.querySelector('[data-record-feature] a');
      const visibleTapTargets = Array.from(document.querySelectorAll('main a')).map((el) => {
        const r = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const hidden = style.display === 'none' || style.visibility === 'hidden' || r.width === 0 || r.height === 0;
        return {
          text: (el.textContent || el.getAttribute('aria-label') || '').trim(),
          width: r.width,
          height: r.height,
          hidden,
        };
      }).filter((l) => !l.hidden);
      return {
        scrollWidth: document.documentElement.scrollWidth,
        chrome: Array.from(document.querySelectorAll('header.site-header, #menu-toggle, #mobile-nav, [data-theme-toggle], footer')).map((el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '')),
        firstLine: document.querySelector('main')?.innerText.trim().split('\n')[0],
        heroPresent: !!hero,
        heroFont: hero ? parseFloat(getComputedStyle(hero).fontSize) : 0,
        heroBottom: hero ? hero.getBoundingClientRect().bottom : 0,
        bodyFont: record ? parseFloat(getComputedStyle(record).fontSize) : 0,
        scaffoldLabels: ['homepage / hero', 'lab / flagship card', 'signal room / episode log'].filter((t) => bodyText.includes(t)),
        rogueOnPage: bodyText.includes('rogue'),
        smallTargets: visibleTapTargets
          .filter((l) => l.width < 44 || l.height < 44)
          .map((l) => `${l.text || 'untitled'}:${l.width.toFixed(1)}x${l.height.toFixed(1)}`),
      };
    });

    if (closed.scrollWidth > width) failures.push(`${width}: horizontal scroll ${closed.scrollWidth}`);
    if (closed.chrome.length) failures.push(`${width}: homepage carries site chrome ${closed.chrome.join(',')}`);
    if (closed.firstLine !== 'Adrian Lumley is a product director in New York City.') failures.push(`${width}: first line is "${closed.firstLine}", expected the lede`);
    if (closed.rogueOnPage) failures.push(`${width}: rogue appears on the homepage`);
    if (!closed.heroPresent) failures.push(`${width}: featured essay title missing`);
    if (closed.scaffoldLabels.length) failures.push(`${width}: scaffold labels ${closed.scaffoldLabels.join(',')}`);
    if (closed.smallTargets.length) failures.push(`${width}: small tap targets ${closed.smallTargets.join(',')}`);
    // the featured essay is the one size jump: about 1.5x body, never a hero that swallows the first screen
    const ratio = closed.bodyFont ? closed.heroFont / closed.bodyFont : 0;
    if (ratio < 1.4 || ratio > 1.6) failures.push(`${width}: featured title ratio suspicious ${ratio.toFixed(2)} (${closed.heroFont}px over ${closed.bodyFont}px body)`);
    if (closed.heroFont > 34) failures.push(`${width}: featured title too large ${closed.heroFont}`);
    if (closed.heroBottom > 900 * 0.5) failures.push(`${width}: featured title sits below the first half-screen at ${closed.heroBottom.toFixed(0)}px`);

    // the shared header lives on the inner pages: wordmark and all three
    // nav links on one line at every width, no menu toggle
    await page.goto(baseUrl + navPath, { waitUntil: 'networkidle' });
    const header = await page.evaluate(() => {
      const logo = document.querySelector('.site-header__wordmark');
      const links = Array.from(document.querySelectorAll('.site-header nav a')).map((el) => {
        const r = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const hidden = style.display === 'none' || style.visibility === 'hidden' || r.width === 0 || r.height === 0;
        return { text: (el.textContent || '').trim(), width: r.width, height: r.height, top: Math.round(r.top), right: r.right, hidden };
      });
      const targets = [...links];
      if (logo) {
        const r = logo.getBoundingClientRect();
        targets.push({ text: logo.textContent.trim(), width: r.width, height: r.height, hidden: false });
      }
      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
        legacyMenu: !!document.querySelector('#menu-toggle, #mobile-nav, [data-theme-toggle]'),
        logoPresent: !!logo,
        logoText: logo?.textContent.trim(),
        logoWhiteSpace: logo ? getComputedStyle(logo).whiteSpace : null,
        logoTop: logo ? Math.round(logo.getBoundingClientRect().top) : null,
        links,
        smallTargets: targets
          .filter((l) => !l.hidden && (l.height < 44 || l.width < 24))
          .map((l) => `${l.text || 'untitled'}:${l.width.toFixed(1)}x${l.height.toFixed(1)}`),
      };
    });
    // the inner page is set in the record's type: one family, one ink, body
    // size everywhere except the page title (the one jump); nothing uppercase, nothing fading in
    const type = await page.evaluate(() => {
      const families = new Set();
      const sizes = new Set();
      const colors = new Set();
      const uppercase = [];
      const animated = [];
      for (const el of document.querySelectorAll('header *, main *, footer *')) {
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        if (style.animationName !== 'none' || Number(style.opacity) < 1) animated.push(el.tagName.toLowerCase());
        const ownText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
        // controls (tag chips) carry their own size
        if (!ownText || el.tagName === 'BUTTON') continue;
        families.add(style.fontFamily.split(',')[0]);
        sizes.add(style.fontSize);
        colors.add(style.color);
        if (style.textTransform === 'uppercase') uppercase.push(el.textContent.trim().slice(0, 30));
      }
      const body = getComputedStyle(document.body);
      const title = getComputedStyle(document.querySelector('main h1'));
      return { families: [...families], sizes: [...sizes].sort(), colors: [...colors], uppercase, animated, bodyFamily: body.fontFamily.split(',')[0], bodySize: body.fontSize, titleSize: title.fontSize };
    });
    if (type.families.length !== 1 || type.families[0] !== type.bodyFamily) failures.push(`${width}: ${navPath} uses families ${type.families.join(', ')}`);
    if (type.colors.length !== 1) failures.push(`${width}: ${navPath} uses inks ${type.colors.join(', ')}`);
    const allowedSizes = [type.bodySize, type.titleSize].sort();
    if (type.sizes.some((size) => !allowedSizes.includes(size))) failures.push(`${width}: ${navPath} uses sizes ${type.sizes.join(', ')}`);
    if (Number.parseFloat(type.titleSize) / Number.parseFloat(type.bodySize) > 1.6) failures.push(`${width}: ${navPath} title ${type.titleSize} over ${type.bodySize} body`);
    if (type.uppercase.length) failures.push(`${width}: ${navPath} uppercase ${type.uppercase.join(',')}`);
    if (type.animated.length) failures.push(`${width}: ${navPath} animates in ${type.animated.join(',')}`);

    if (header.scrollWidth > width) failures.push(`${width}: ${navPath} horizontal scroll ${header.scrollWidth}`);
    if (!header.logoPresent) failures.push(`${width}: logo missing`);
    if (header.logoText !== 'adrian lumley') failures.push(`${width}: logo text changed to ${header.logoText || 'missing'}`);
    if (header.logoWhiteSpace !== 'nowrap') failures.push(`${width}: logo whitespace is ${header.logoWhiteSpace || 'missing'}, expected nowrap`);
    if (header.smallTargets.length) failures.push(`${width}: header small tap targets ${header.smallTargets.join(',')}`);

    if (header.legacyMenu) failures.push(`${width}: ${navPath} still carries a menu toggle or night shift control`);
    for (const expected of ['writing', 'lab', 'about']) {
      const link = header.links.find((l) => l.text === expected);
      if (!link || link.hidden) failures.push(`${width}: header nav missing visible ${expected}`);
      else {
        if (link.top !== header.links[0].top) failures.push(`${width}: header nav wraps at ${expected}`);
        if (link.right > header.viewport) failures.push(`${width}: header nav ${expected} runs off screen`);
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
  if (server) server.kill('SIGTERM');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('mobile homepage verifier passed');
