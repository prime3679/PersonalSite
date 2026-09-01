import { z } from 'zod';

export const blogSchema = z.object({
  title: z.string(),
  /** Optional shorter display title for dense index rows (the homepage archive). */
  shortTitle: z.string().optional(),
  description: z.string(),
  date: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  published: z.boolean().optional().default(true),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});
