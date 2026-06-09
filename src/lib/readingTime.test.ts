import { describe, it, expect } from 'vitest';
import { readingTime } from './readingTime';

describe('readingTime', () => {
  it('returns at least 1 minute for very short content', () => {
    expect(readingTime('just a few words here')).toBe(1);
  });

  it('rounds based on ~200 words per minute', () => {
    const body = Array.from({ length: 600 }, () => 'word').join(' ');
    expect(readingTime(body)).toBe(3);
  });

  it('handles an empty body without crashing', () => {
    expect(readingTime('')).toBe(1);
  });
});
