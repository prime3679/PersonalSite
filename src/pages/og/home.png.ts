import type { APIRoute } from 'astro';
import { generateOgImage } from '../../lib/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage(
    'Adrian Lumley',
    'Director of Product at Salesforce. Building at the intersection of AI and enterprise.',
  );

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
