import { defineCollection, z } from 'astro:content';
import { blogSchema } from './blogSchema';

const blog = defineCollection({
  type: 'content',
  schema: blogSchema,
});

const signalRoom = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    episode: z.number(),
    /** Month-level publication date — used for ordering and the RSS feed. */
    date: z.coerce.date(),
    /** One-line teaser shown on the index and used as the page description. */
    teaser: z.string(),
    /** Chip texts rendered above the episode title, e.g. "episode 01". */
    badges: z.array(z.string()),
  }),
});

export const collections = { blog, 'signal-room': signalRoom };
