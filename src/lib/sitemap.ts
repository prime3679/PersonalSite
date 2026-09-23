import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const canonicalPublicAstroPaths = [
  '/',
  '/about/',
  '/contact/',
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
