import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const canonicalPublicAstroPaths = [
  '/',
  '/about',
  '/contact',
  '/joytap-privacy',
  '/lab',
  '/services',
  '/signal-room',
  '/work',
  '/writing',
] as const;

export function getIndexableStaticLabPaths(
  labRoot = join(process.cwd(), 'public', 'lab'),
): string[] {
  return readdirSync(labRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => existsSync(join(labRoot, entry.name, 'index.html')))
    .map((entry) => `/lab/${entry.name}`)
    .sort();
}

export async function getCanonicalSitemapPaths(): Promise<string[]> {
  const { getEpisodes, getPublishedPosts, episodePath, postPath } = await import('./content');
  const posts = await getPublishedPosts();
  const episodes = await getEpisodes('asc');

  return [
    ...canonicalPublicAstroPaths,
    ...posts.map((post) => postPath(post.slug)),
    ...episodes.map((episode) => episodePath(episode.slug)),
    ...getIndexableStaticLabPaths(),
  ];
}
