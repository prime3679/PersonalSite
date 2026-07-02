import type { APIRoute } from 'astro';
import { generateOgImage, pngResponse } from '../../lib/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage(
    'adrian lumley',
    'director of product at salesforce. building ai systems hands-on in nyc.',
  );

  return pngResponse(png);
};
