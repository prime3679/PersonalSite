import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// this endpoint is the site's only sitemap (robots.txt points at
// /sitemap.xml). a new astro page is not listed until it is added here.
export const canonicalPublicAstroPaths = [
  '/',
  '/about/',
  '/contact/',
  '/privacy/',
  '/lab/',
  '/writing/',
] as const;

export function getIndexableStaticLabPaths(
  labRoot = join(process.cwd(), 'public', 'lab'),
): string[] {
  return readdirSync(labRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => existsSync(join(labRoot, entry.name, 'index.html')))
    .map((entry) => `/lab/${entry.name}/`)
    .sort();
}

export async function getCanonicalSitemapPaths(): Promise<string[]> {
  const { getPublishedPosts, postPath } = await import('./content');
  const posts = await getPublishedPosts();

  return [
    ...canonicalPublicAstroPaths,
    ...posts.map((post) => postPath(post.id)),
    ...getIndexableStaticLabPaths(),
  ];
}
