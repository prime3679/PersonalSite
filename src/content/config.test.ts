import { describe, it, expect, vi } from 'vitest';
import { blogSchema } from './blogSchema';

// Mock astro:content before importing config
vi.mock('astro:content', () => ({
  defineCollection: vi.fn((config) => config),
}));

import { collections } from './config';

describe('collections config', () => {
  it('should export a blog collection with correct type and schema', () => {
    expect(collections.blog).toBeDefined();
    expect(collections.blog.type).toBe('content');
    expect(collections.blog.schema).toBe(blogSchema);
  });
});

describe('blogSchema', () => {
  it('should parse valid data with all fields', () => {
    const validData = {
      title: 'My First Blog Post',
      description: 'A great post',
      date: '2023-01-01',
      updatedDate: '2023-01-02',
      published: false,
      excerpt: 'This is an excerpt.',
    };

    const result = blogSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe(validData.title);
      expect(result.data.description).toBe(validData.description);
      expect(result.data.date).toBeInstanceOf(Date);
      expect(result.data.updatedDate).toBeInstanceOf(Date);
      expect(result.data.published).toBe(false);
      expect(result.data.excerpt).toBe(validData.excerpt);
    }
  });

  it('should parse minimal valid data and apply defaults', () => {
    const minimalData = {
      title: 'Minimal Post',
      description: 'Just the basics',
      date: '2023-01-01',
    };

    const result = blogSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe(minimalData.title);
      expect(result.data.description).toBe(minimalData.description);
      expect(result.data.date).toBeInstanceOf(Date);
      expect(result.data.updatedDate).toBeUndefined();
      expect(result.data.published).toBe(true); // Default value
      expect(result.data.excerpt).toBeUndefined();
    }
  });

  it('should fail when missing required fields', () => {
    const invalidData = {
      title: 'Missing fields',
      // description is missing
      // date is missing
    };

    const result = blogSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.description).toBeDefined();
      expect(formattedErrors.date).toBeDefined();
    }
  });

  it('should fail with invalid data types', () => {
    const invalidData = {
      title: 123, // Should be string
      description: 'Valid description',
      date: 'not-a-date', // Invalid date string
      published: 'yes', // Should be boolean
    };

    const result = blogSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const formattedErrors = result.error.format();
      expect(formattedErrors.title).toBeDefined();
      expect(formattedErrors.date).toBeDefined();
      expect(formattedErrors.published).toBeDefined();
    }
  });
});
