import { getCollection } from 'astro:content';

/**
 * Canonical content queries. Pages, RSS, and OG endpoints all read the
 * collections through these so "published" and ordering mean the same thing
 * everywhere.
 */

/** Blog posts with `published: false` filtered out, newest first. */
export async function getPublishedPosts() {
  // blogSchema defaults `published` to true, so this is a plain boolean read.
  return (await getCollection('blog'))
    .filter((post) => post.data.published)
    .sort((a, b) => {
      const dateOrder = b.data.date.valueOf() - a.data.date.valueOf();
      if (dateOrder !== 0) return dateOrder;
      return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
    });
}

/** Signal Room episodes ordered by episode number. */
export async function getEpisodes(order: 'asc' | 'desc' = 'desc') {
  const sign = order === 'asc' ? 1 : -1;
  return (await getCollection('signal-room')).sort(
    (a, b) => sign * (a.data.episode - b.data.episode),
  );
}

/** Return a Markdown entry body and fail closed if a loader drops it. */
export function contentBody(entry: { id: string; body?: string }) {
  if (typeof entry.body !== 'string') {
    throw new Error(`Content entry ${entry.id} has no Markdown body.`);
  }
  return entry.body;
}

/**
 * Site-relative URLs , single place that knows the routing scheme.
 * The trailing-slash difference is historical but load-bearing: these exact
 * forms are the RSS GUIDs, and changing them would resurface every item as
 * unread in subscribers' feed readers.
 */
export const postPath = (slug: string) => `/writing/${slug}`;
export const episodePath = (slug: string) => `/signal-room/${slug}/`;

/** Generated OG-card routes (must mirror the endpoints under src/pages/og/). */
export const postOgPath = (slug: string) => `/og/${slug}.png`;
export const episodeOgPath = (slug: string) => `/og/signal-room/${slug}.png`;
