import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCollectionMock = vi.hoisted(() => vi.fn());

vi.mock('astro:content', () => ({
  getCollection: getCollectionMock,
}));

import { getPublishedPosts, postHref, postPath } from './content';

const post = (id: string, date: string, published = true) => ({
  id,
  data: {
    title: id,
    description: `${id} description`,
    date: new Date(date),
    published,
  },
});

describe('getPublishedPosts', () => {
  beforeEach(() => {
    getCollectionMock.mockReset();
  });

  it('orders newest first and resolves identical dates by descending entry id', async () => {
    getCollectionMock.mockResolvedValue([
      post('first-post', '2025-03-20'),
      post('older-post', '2025-02-01'),
      post('second-order-effects', '2025-03-20'),
      post('newest-post', '2025-04-01'),
    ]);

    const posts = await getPublishedPosts();

    expect(posts.map(({ id }) => id)).toEqual([
      'newest-post',
      'second-order-effects',
      'first-post',
      'older-post',
    ]);
  });

  it('excludes unpublished entries', async () => {
    getCollectionMock.mockResolvedValue([
      post('published-post', '2025-03-20'),
      post('draft-post', '2025-04-01', false),
    ]);

    const posts = await getPublishedPosts();

    expect(posts.map(({ id }) => id)).toEqual(['published-post']);
  });
});

describe('post paths', () => {
  it('keeps the slashless RSS GUID form and links pages to the canonical trailing-slash form', () => {
    expect(postPath('the-honest-record')).toBe('/writing/the-honest-record');
    expect(postHref('the-honest-record')).toBe('/writing/the-honest-record/');
  });
});
