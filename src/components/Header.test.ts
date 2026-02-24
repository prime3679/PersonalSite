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

test('Header includes skip-to-content link', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Header);

  expect(result).toContain('href="#main-content"');
  expect(result).toContain('Skip to content');
});

test('Header has aria-label on nav elements', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Header);

  expect(result).toContain('aria-label="Main navigation"');
  expect(result).toContain('aria-label="Mobile navigation"');
});
