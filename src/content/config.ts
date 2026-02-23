import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    published: z.boolean().optional().default(true),
    // Optional excerpt if you want to explicitly define it, otherwise description is used
    excerpt: z.string().optional(),
  }),
});

export const collections = { blog };
