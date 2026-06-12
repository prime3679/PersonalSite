import type { APIRoute } from 'astro';
import { generateOgImage, pngResponse } from '../../lib/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage(
    'Adrian Lumley',
    'Director of Product at Salesforce. Building at the intersection of AI and enterprise.',
  );

  return pngResponse(png);
};
