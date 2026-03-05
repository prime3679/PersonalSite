import { describe, it, expect } from 'vitest';
import { blogSchema } from './blogSchema';

describe('blogSchema', () => {
  it('validates a correct full blog post frontmatter', () => {
    const validData = {
      title: 'My First Post',
      description: 'A description of my first post',
      date: '2023-10-27',
      updatedDate: '2023-10-28',
      published: false,
      excerpt: 'This is a short excerpt.',
    };

    const result = blogSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('My First Post');
      expect(result.data.date).toBeInstanceOf(Date);
      expect(result.data.published).toBe(false);
    }
  });

  it('validates with only required fields and provides defaults', () => {
    const requiredData = {
      title: 'Minimal Post',
      description: 'Just the required bits',
      date: '2023-10-27T10:00:00Z',
    };

    const result = blogSchema.safeParse(requiredData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.published).toBe(true); // default value
      expect(result.data.excerpt).toBeUndefined();
    }
  });

  it('fails when missing required title', () => {
    const invalidData = {
      description: 'Missing title',
      date: '2023-10-27',
    };

    const result = blogSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('fails when date is invalid string', () => {
    const invalidData = {
      title: 'Post with bad date',
      description: 'Date is invalid',
      date: 'not-a-date',
    };

    const result = blogSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
