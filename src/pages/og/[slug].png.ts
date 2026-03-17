import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOgImage } from '../../lib/og-image';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts
    .filter((post) => post.data.published !== false)
    .map((post) => ({
      params: { slug: post.slug },
      props: { title: post.data.title, description: post.data.description },
    }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, description } = props as { title: string; description: string };
  const png = await generateOgImage(title, description);

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
