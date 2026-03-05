import { z } from 'astro/zod';

export const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  published: z.boolean().optional().default(true),
  excerpt: z.string().optional(),
});
