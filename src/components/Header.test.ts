import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Header from './Header.astro';

test('Header renders navigation links', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Header);

  expect(result).toContain('href="/"');
  expect(result).toContain('href="/work"');
  expect(result).toContain('href="/blog"');
  expect(result).toContain('href="/services"');
  expect(result).toContain('href="/lab"');
  expect(result).toContain('href="/bishop-development"');
  expect(result).toContain('href="/contact"');
});
