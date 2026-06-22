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

const browser = await chromium.launch();
try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, isMobile: true, deviceScaleFactor: 2 });
    await page.goto(baseUrl + '/', { waitUntil: 'networkidle' });
    const closed = await page.evaluate(() => {
      const bodyText = document.body.innerText.toLowerCase();
      const toggle = document.querySelector('#menu-toggle');
      const logo = document.querySelector('.site-header__logo');
      const hero = document.querySelector('.hero-title');
      const visibleTapTargets = Array.from(document.querySelectorAll('.site-header a, #menu-toggle, main a')).map((el) => {
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
        hasToggle: !!toggle,
        toggleVisible: toggle ? getComputedStyle(toggle).display !== 'none' && getComputedStyle(toggle).visibility !== 'hidden' : false,
        logoPresent: !!logo,
        logoText: logo?.textContent.trim(),
        logoWhiteSpace: logo ? getComputedStyle(logo).whiteSpace : null,
        heroPresent: !!hero,
        heroFont: hero ? parseFloat(getComputedStyle(hero).fontSize) : 0,
        scaffoldLabels: ['homepage / hero', 'lab / flagship card', 'signal room / episode log'].filter((t) => bodyText.includes(t)),
        smallTargets: visibleTapTargets
          .filter((l) => l.width < 44 || l.height < 44)
          .map((l) => `${l.text || 'untitled'}:${l.width.toFixed(1)}x${l.height.toFixed(1)}`),
      };
    });

    if (closed.scrollWidth > width) failures.push(`${width}: horizontal scroll ${closed.scrollWidth}`);
    if (!closed.hasToggle || !closed.toggleVisible) failures.push(`${width}: mobile menu toggle missing or hidden`);
    if (!closed.logoPresent) failures.push(`${width}: logo missing`);
    if (closed.logoText !== 'adrian lumley') failures.push(`${width}: logo text changed to ${closed.logoText || 'missing'}`);
    if (closed.logoWhiteSpace !== 'nowrap') failures.push(`${width}: logo whitespace is ${closed.logoWhiteSpace || 'missing'}, expected nowrap`);
    if (!closed.heroPresent) failures.push(`${width}: hero title missing`);
    if (closed.scaffoldLabels.length) failures.push(`${width}: scaffold labels ${closed.scaffoldLabels.join(',')}`);
    if (closed.smallTargets.length) failures.push(`${width}: small tap targets ${closed.smallTargets.join(',')}`);
    if (closed.heroFont > 34 || closed.heroFont < 26) failures.push(`${width}: hero font suspicious ${closed.heroFont}`);

    await page.click('#menu-toggle');
    const open = await page.evaluate(() => {
      const panel = document.querySelector('#mobile-nav');
      const links = Array.from(document.querySelectorAll('#mobile-nav a')).map((el) => {
        const r = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const hidden = style.display === 'none' || style.visibility === 'hidden' || r.width === 0 || r.height === 0;
        return {
          text: (el.textContent || '').trim().toLowerCase(),
          width: r.width,
          height: r.height,
          hidden,
        };
      });
      return {
        panelPresent: !!panel,
        panelHidden: panel ? panel.hasAttribute('hidden') : true,
        links,
        smallTargets: links
          .filter((l) => !l.hidden)
          .filter((l) => l.width < 44 || l.height < 44)
          .map((l) => `${l.text || 'untitled'}:${l.width.toFixed(1)}x${l.height.toFixed(1)}`),
      };
    });
    if (!open.panelPresent || open.panelHidden) failures.push(`${width}: mobile menu did not open`);
    for (const expected of ['work', 'lab', 'writing', 'signal room', 'contact']) {
      if (!open.links.some((l) => l.text === expected && !l.hidden)) failures.push(`${width}: open mobile menu missing visible ${expected}`);
    }
    if (open.smallTargets.length) failures.push(`${width}: open menu small tap targets ${open.smallTargets.join(',')}`);
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
