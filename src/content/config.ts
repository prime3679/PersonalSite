import { defineCollection } from 'astro:content';
import { blogSchema } from './blogSchema';
import { signalRoomSchema } from './signalRoomSchema';

const blog = defineCollection({
  type: 'content',
  schema: blogSchema,
});

const signalRoom = defineCollection({
  type: 'content',
  schema: signalRoomSchema,
});

export const collections = { blog, 'signal-room': signalRoom };
