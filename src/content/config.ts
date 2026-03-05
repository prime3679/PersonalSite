import { defineCollection } from 'astro:content';
import { blogSchema } from './blogSchema';

const blog = defineCollection({
  type: 'content',
  schema: blogSchema,
});

export const collections = { blog };
