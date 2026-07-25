import { describe, it, expect, vi } from 'vitest';
import { blogSchema } from './blogSchema';
import { signalRoomSchema } from './signalRoomSchema';

// Mock astro:content before importing config
vi.mock('astro:content', () => ({
  defineCollection: vi.fn((config) => config),
}));
vi.mock('astro/loaders', () => ({
  glob: vi.fn((config) => ({ kind: 'glob', ...config })),
}));

import { collections } from '../content.config';

type MockCollection = {
  loader: { kind: string; pattern: string; base: string };
  schema: unknown;
};

describe('collections config', () => {
  it('should export a blog collection with the content layer loader and schema', () => {
    const collection = collections.blog as unknown as MockCollection;
    expect(collection).toBeDefined();
    expect(collection.loader).toMatchObject({
      kind: 'glob',
      pattern: '**/*.{md,mdx}',
      base: './src/content/blog',
    });
    expect(collection.schema).toBe(blogSchema);
  });

  it('should export the signal-room collection', () => {
    const collection = collections['signal-room'] as unknown as MockCollection;
    expect(collection).toBeDefined();
    expect(collection.loader).toMatchObject({
      kind: 'glob',
      pattern: '**/*.{md,mdx}',
      base: './src/content/signal-room',
    });
    expect(collection.schema).toBe(signalRoomSchema);
  });
});

describe('signalRoomSchema', () => {
  it('should parse a valid episode and coerce the date', () => {
    const result = signalRoomSchema.safeParse({
      title: 'night shift',
      episode: 1,
      date: '2026-05-01',
      teaser: 'a quiet house, a crowded queue.',
      badges: ['episode 01', 'night shift'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBeInstanceOf(Date);
      expect(result.data.episode).toBe(1);
    }
  });

  it('should fail when episode metadata is missing', () => {
    const result = signalRoomSchema.safeParse({ title: 'incomplete' });
    expect(result.success).toBe(false);
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
      const invalidFields = result.error.issues.map((issue) => issue.path[0]);
      expect(invalidFields).toContain('description');
      expect(invalidFields).toContain('date');
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
      const invalidFields = result.error.issues.map((issue) => issue.path[0]);
      expect(invalidFields).toContain('title');
      expect(invalidFields).toContain('date');
      expect(invalidFields).toContain('published');
    }
  });
});
