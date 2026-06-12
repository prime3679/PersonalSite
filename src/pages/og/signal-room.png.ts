import type { APIRoute } from 'astro';
import { generateOgImage, pngResponse } from '../../lib/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage('signal room', 'a fiction serial · new episodes weekly');

  return pngResponse(png);
};
