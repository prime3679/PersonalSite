import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    published: z.boolean().optional().default(true),
    excerpt: z.string().optional(),
  }),
});

export const collections = { blog };
