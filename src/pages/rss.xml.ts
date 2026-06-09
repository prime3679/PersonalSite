import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteMetadata } from '../data/siteMetadata';

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

  const posts = (await getCollection('blog'))
    .filter((post) => post.data.published !== false)
    .map((post): FeedItem => ({
      title: post.data.title,
      url: `${site}/blog/${post.slug}`,
      date: post.data.date,
      description: post.data.description,
    }));

  const pad = (n: number) => String(n).padStart(2, '0');
  const episodes = (await getCollection('signal-room'))
    .map((ep): FeedItem => ({
      title: `signal room ${pad(ep.data.episode)} · ${ep.data.title}`,
      url: `${site}/signal-room/${ep.slug}/`,
      date: ep.data.date,
      description: ep.data.teaser,
    }));

  const items = [...posts, ...episodes]
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
    <title>${escapeXml(siteMetadata.title)} — Writing</title>
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
