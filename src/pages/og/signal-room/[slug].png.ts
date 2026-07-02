import type { APIRoute, GetStaticPaths } from 'astro';
import { generateOgImage, pngResponse } from '../../../lib/og-image';
import { getEpisodes } from '../../../lib/content';
import { formatLongDate, padEpisode } from '../../../lib/format';

export const getStaticPaths: GetStaticPaths = async () => {
  return (await getEpisodes()).map((ep) => ({
    params: { slug: ep.slug },
    props: {
      title: ep.data.title,
      subtitle: `signal room · episode ${padEpisode(ep.data.episode)} · ${formatLongDate(ep.data.date)}`,
    },
  }));
};

export const GET: APIRoute<{ title: string; subtitle: string }> = async ({ props }) => {
  const { title, subtitle } = props;
  const png = await generateOgImage(title, subtitle, 'signal room');

  return pngResponse(png);
};
