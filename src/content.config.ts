import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogSchema } from './content/blogSchema';
import { signalRoomSchema } from './content/signalRoomSchema';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: blogSchema,
});

const signalRoom = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/signal-room' }),
  schema: signalRoomSchema,
});

export const collections = { blog, 'signal-room': signalRoom };