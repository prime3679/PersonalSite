import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Header from './Header.astro';

test('Header renders the canonical editorial navigation once', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Header);

  expect(result).toContain('class="site-header"');
  expect(result).toContain('href="/"');
  expect(result).toContain('adrian lumley');
  expect(result).toContain('href="/work"');
  expect(result).toContain('href="/lab"');
  expect(result).toContain('href="/writing"');
  expect(result).toContain('href="/signal-room"');
  expect(result).toContain('href="/contact"');
  expect(result).not.toContain('href="/about"');
  expect(result).not.toContain('href="/blog"');
  expect(result).not.toContain('id="theme-toggle"');
  expect(result).toContain('id="menu-toggle"');
  expect(result).toContain('id="site-mobile-nav"');
  expect(result).toContain('aria-controls="site-mobile-nav"');
});
