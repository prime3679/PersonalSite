import { describe, expect, it } from 'vitest';
import { absoluteUrl, canonicalUrl, normalizeCanonicalPath } from './seo';

describe('seo helpers', () => {
  it('normalizes canonical paths to trailing slashes for html routes and preserves file urls', () => {
    expect(normalizeCanonicalPath('/')).toBe('/');
    expect(normalizeCanonicalPath('/writing')).toBe('/writing/');
    expect(normalizeCanonicalPath('/signal-room/night-shift/')).toBe('/signal-room/night-shift/');
    expect(normalizeCanonicalPath('/sitemap.xml')).toBe('/sitemap.xml');
    expect(normalizeCanonicalPath('/images/adrian-lumley.jpg')).toBe('/images/adrian-lumley.jpg');
  });

  it('builds absolute canonical urls without query strings', () => {
    expect(canonicalUrl('http://www.adrianlumley.co/work?ref=test')).toBe('https://adrianlumley.co/work/');
    expect(canonicalUrl('https://adrianlumley.co/')).toBe('https://adrianlumley.co/');
    expect(absoluteUrl('/images/adrian-lumley.jpg')).toBe('https://adrianlumley.co/images/adrian-lumley.jpg');
  });
});
