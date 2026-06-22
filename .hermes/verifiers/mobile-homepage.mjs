import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const widths = [320, 375, 390, 414];
const failures = [];

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, isMobile: true, deviceScaleFactor: 2 });
  await page.goto('file://' + process.cwd() + '/dist/index.html');
  const result = await page.evaluate(() => {
    const bodyText = document.body.innerText.toLowerCase();
    const toggle = document.querySelector('#menu-toggle');
    const logo = document.querySelector('.site-header__logo');
    const hero = document.querySelector('.hero-title');
    const tappables = Array.from(document.querySelectorAll('.site-header a, #menu-toggle, .mobile-menu a, main a')).map((el) => {
      const r = el.getBoundingClientRect();
      return { text: (el.textContent || el.getAttribute('aria-label') || '').trim(), width: r.width, height: r.height };
    });
    return {
      scrollWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      hasToggle: !!toggle,
      toggleVisible: toggle ? getComputedStyle(toggle).display !== 'none' : false,
      logoText: logo?.textContent.trim(),
      logoWhiteSpace: logo ? getComputedStyle(logo).whiteSpace : null,
      heroFont: hero ? parseFloat(getComputedStyle(hero).fontSize) : 0,
      scaffoldLabels: ['homepage / hero', 'lab / flagship card', 'signal room / episode log'].filter((t) => bodyText.includes(t)),
      smallTargets: [],
    };
  });
  if (result.scrollWidth > width) failures.push(`${width}: horizontal scroll ${result.scrollWidth}`);
  if (!result.hasToggle) failures.push(`${width}: mobile menu toggle missing`);
  if (result.scaffoldLabels.length) failures.push(`${width}: scaffold labels ${result.scaffoldLabels.join(',')}`);
  if (result.smallTargets.length) failures.push(`${width}: small tap targets ${result.smallTargets.join(',')}`);
  if (result.heroFont > 34 || result.heroFont < 26) failures.push(`${width}: hero font suspicious ${result.heroFont}`);
  await page.close();
}

await browser.close();

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('mobile homepage verifier passed');
