import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Iron Log was the only audited sitemap page without a semantic h1. Its visible
// logo carries the page title, so it should be the single h1. The .logo class
// keeps the visual appearance identical (the global reset zeroes h1 margins and
// .logo pins font-size/weight), so this is a semantics-only change.
describe('iron-log heading semantics', () => {
  const html = readFileSync(
    join(process.cwd(), 'public', 'lab', 'iron-log', 'index.html'),
    'utf8',
  );

  it('exposes exactly one h1', () => {
    const count = (html.match(/<h1[\s>]/g) ?? []).length;
    expect(count).toBe(1);
  });

  it('uses the existing logo element as the h1 without changing its styling hook', () => {
    expect(html).toContain('<h1 class="logo">Iron <span>Log</span></h1>');
    // the old non-semantic logo div must be gone
    expect(html).not.toContain('<div class="logo">');
  });
});
