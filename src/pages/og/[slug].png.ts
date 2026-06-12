import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOgImage } from '../../lib/og-image';
import { getPublishedPosts } from '../../lib/content';

export const getStaticPaths: GetStaticPaths = async () => {
  return (await getPublishedPosts())
    .map((post) => ({
      params: { slug: post.slug },
      props: { title: post.data.title, description: post.data.description },
    }));
};

export const GET: APIRoute<{ title: string; description: string }> = async ({ props }) => {
  const { title, description } = props;
  const png = await generateOgImage(title, description);

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
