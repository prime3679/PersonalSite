import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { canonicalUrl } from './lib/seo';
import { getIndexableStaticLabPaths } from './lib/sitemap';

describe('static lab html heads', () => {
  for (const path of getIndexableStaticLabPaths()) {
    it(`${path} includes canonical og and twitter metadata`, () => {
      const slug = path.split('/').filter(Boolean).at(-1);
      const html = readFileSync(
        join(process.cwd(), 'public', 'lab', slug!, 'index.html'),
        'utf8',
      );

      expect(html).toContain(`<link rel="canonical" href="${canonicalUrl(path)}" />`);
      expect(html).toContain('<meta property="og:title"');
      expect(html).toContain(`<meta property="og:url" content="${canonicalUrl(path)}" />`);
      expect(html).toContain('<meta property="og:type" content="website" />');
      expect(html).toContain('<meta property="og:image" content="https://adrianlumley.co/og/home.png" />');
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
      expect(html).toContain('<meta name="twitter:title"');
      expect(html).toContain('<meta name="twitter:image" content="https://adrianlumley.co/og/home.png" />');
    });
  }
});
