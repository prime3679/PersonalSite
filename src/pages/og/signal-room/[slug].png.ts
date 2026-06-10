import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOgImage } from '../../../lib/og-image';

export const getStaticPaths: GetStaticPaths = async () => {
  const episodes = await getCollection('signal-room');
  return episodes.map((ep) => {
    const num = String(ep.data.episode).padStart(2, '0');
    const date = ep.data.date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
    return {
      params: { slug: ep.slug },
      props: { title: ep.data.title, subtitle: `signal room · episode ${num} · ${date}` },
    };
  });
};

export const GET: APIRoute<{ title: string; subtitle: string }> = async ({ props }) => {
  const { title, subtitle } = props;
  const png = await generateOgImage(title, subtitle);

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
