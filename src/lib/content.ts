import { getCollection } from 'astro:content';

/**
 * Canonical content queries. Pages, RSS, and OG endpoints all read the
 * collections through these so "published" and ordering mean the same thing
 * everywhere.
 */

/** Blog posts with `published: false` filtered out, newest first. */
export async function getPublishedPosts() {
  return (await getCollection('blog'))
    .filter((post) => post.data.published !== false)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Signal Room episodes ordered by episode number. */
export async function getEpisodes(order: 'asc' | 'desc' = 'desc') {
  const sign = order === 'asc' ? 1 : -1;
  return (await getCollection('signal-room')).sort(
    (a, b) => sign * (a.data.episode - b.data.episode),
  );
}

/**
 * Site-relative URLs — single place that knows the routing scheme.
 * The trailing-slash difference is historical but load-bearing: these exact
 * forms are the RSS GUIDs, and changing them would resurface every item as
 * unread in subscribers' feed readers.
 */
export const postPath = (slug: string) => `/blog/${slug}`;
export const episodePath = (slug: string) => `/signal-room/${slug}/`;
