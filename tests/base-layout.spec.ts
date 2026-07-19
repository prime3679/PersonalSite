import { expect, test, type Page } from '@playwright/test';

const exactTitles = [
  ['/', 'Adrian Lumley | AI Diligence Analyst and Product Leader', 'https://adrianlumley.co/'],
  ['/writing', 'Writing | Adrian Lumley', 'https://adrianlumley.co/writing'],
  ['/lab', 'Lab | Adrian Lumley', 'https://adrianlumley.co/lab'],
  ['/work', 'Work | Adrian Lumley', 'https://adrianlumley.co/work'],
  ['/signal-room', 'Signal Room | Adrian Lumley', 'https://adrianlumley.co/signal-room'],
  ['/contact', 'Contact | Adrian Lumley', 'https://adrianlumley.co/contact'],
] as const;

async function readStructuredData(page: Page) {
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  expect(raw).toBeTruthy();
  return JSON.parse(raw!);
}

test.describe('base layout seo', () => {
  test('homepage preserves the expected meta tags and person schema', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Adrian Lumley | AI Diligence Analyst and Product Leader');
    await expect(page.locator('main h1')).toHaveText('adrian lumley');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'Adrian Lumley is a product leader working where AI meets enterprise adoption.',
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Adrian Lumley | AI Diligence Analyst and Product Leader',
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://adrianlumley.co/',
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://adrianlumley.co/og/home.png',
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://adrianlumley.co/',
    );

    const structuredData = await readStructuredData(page);
    const person = structuredData['@graph'].find((entry: { '@type': string }) => entry['@type'] === 'Person');

    expect(person).toMatchObject({
      name: 'Adrian Lumley',
      url: 'https://adrianlumley.co',
      image: 'https://adrianlumley.co/images/adrian-lumley.jpg',
      jobTitle: 'AI Diligence Analyst',
      description: 'Enterprise product leader and independent AI diligence analyst. Creator of The Trust Layer.',
      knowsAbout: [
        'AI evaluation',
        'AI diligence',
        'Product management',
        'Enterprise software',
        'AI agents',
      ],
      sameAs: [
        'https://www.linkedin.com/in/adrianlumley/',
        'https://github.com/prime3679',
      ],
    });
    expect(person.worksFor).toBeUndefined();
    expect(person.alumniOf.map((entry: { name: string }) => entry.name)).toEqual([
      "St. John's University",
      'Quantic School of Business and Technology',
    ]);
  });

  for (const [path, title, canonical] of exactTitles) {
    test(`${path} uses the exact canonical title metadata`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveTitle(title);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        'content',
        'summary_large_image',
      );
    });
  }

  test('article routes keep article schema and canonicalize trailing-slash routes', async ({ page }) => {
    await page.goto('/writing/meeting-cost');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://adrianlumley.co/writing/meeting-cost',
    );

    const postStructuredData = await readStructuredData(page);
    const postArticle = postStructuredData['@graph'].find((entry: { '@type': string }) => entry['@type'] === 'Article');
    expect(postArticle).toMatchObject({
      url: 'https://adrianlumley.co/writing/meeting-cost',
    });
    expect(JSON.stringify(postStructuredData)).not.toContain('worksFor');

    await page.goto('/signal-room/night-shift/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://adrianlumley.co/signal-room/night-shift',
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  });
});
