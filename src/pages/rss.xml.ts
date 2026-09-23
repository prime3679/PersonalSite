import type { APIRoute } from 'astro';
import { siteMetadata } from '../data/siteMetadata';
import { getPublishedPosts, postPath } from '../lib/content';

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

interface FeedItem {
  title: string;
  url: string;
  date: Date;
  description: string;
}

export const GET: APIRoute = async (context) => {
  const site = (context.site?.href ?? `${siteMetadata.url}/`).replace(/\/$/, '');

  const posts = (await getPublishedPosts()).map((post): FeedItem => ({
    title: post.data.title,
    url: `${site}${postPath(post.id)}`,
    date: post.data.date,
    description: post.data.description,
  }));

  const items = posts
    .sort((a, b) => b.date.valueOf() - a.date.valueOf())
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>adrian lumley · writing</title>
    <link>${site}</link>
    <description>${escapeXml(siteMetadata.description)}</description>
    <language>en-us</language>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
