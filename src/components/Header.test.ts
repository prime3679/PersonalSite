// @vitest-environment node

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Header from './Header.astro';

test('Header renders the three-item nav with no menu or theme toggle', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Header);

  expect(result).toContain('class="site-header"');
  expect(result).toContain('href="/"');
  expect(result).toContain('adrian lumley');
  // nav hrefs carry the canonical trailing slash so a click is one request
  expect(result).toContain('href="/writing/"');
  expect(result).toContain('href="/lab/"');
  expect(result).toContain('href="/about/"');
  for (const retired of ['/work/', '/contact/', '/signal-room/', '/blog']) {
    expect(result).not.toContain(`href="${retired}`);
  }
  expect(result).not.toContain('id="menu-toggle"');
  expect(result).not.toContain('id="mobile-nav"');
  expect(result).not.toContain('data-theme-toggle');
});
