import { describe, it, expect } from 'vitest';
import { blogSchema } from './blogSchema';

describe('blog schema', () => {
  it('validates a valid blog post frontmatter', () => {
    const validData = {
      title: 'Test Post',
      description: 'Test description',
      date: '2023-01-01',
      published: true,
      excerpt: 'Test excerpt',
    };

    const result = blogSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Test Post');
      expect(result.data.date).toBeInstanceOf(Date);
      expect(result.data.published).toBe(true);
    }
  });

  it('fails when required fields are missing', () => {
    const invalidData = {
      description: 'Test description',
      date: '2023-01-01',
    };

    const result = blogSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe('title');
    }
  });

  it('provides default value for published', () => {
    const dataWithoutPublished = {
      title: 'Test Post',
      description: 'Test description',
      date: '2023-01-01',
    };

    const result = blogSchema.safeParse(dataWithoutPublished);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.published).toBe(true);
    }
  });

  it('coerces string dates to Date objects', () => {
    const dataWithStringDates = {
      title: 'Test Post',
      description: 'Test description',
      date: '2023-01-01',
      updatedDate: '2023-01-02',
    };

    const result = blogSchema.safeParse(dataWithStringDates);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBeInstanceOf(Date);
      expect(result.data.updatedDate).toBeInstanceOf(Date);
    }
  });
});
