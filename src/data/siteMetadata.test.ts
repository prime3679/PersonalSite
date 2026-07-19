import { describe, it, expect } from 'vitest';
import { siteMetadata } from './siteMetadata';

describe('siteMetadata', () => {
  it('should exist and be an object', () => {
    expect(siteMetadata).toBeDefined();
    expect(typeof siteMetadata).toBe('object');
    expect(siteMetadata).not.toBeNull();
  });

  it('should have all required base string fields', () => {
    expect(typeof siteMetadata.siteName).toBe('string');
    expect(siteMetadata.siteName.length).toBeGreaterThan(0);

    expect(typeof siteMetadata.title).toBe('string');
    expect(siteMetadata.title.length).toBeGreaterThan(0);

    expect(typeof siteMetadata.description).toBe('string');
    expect(siteMetadata.description.length).toBeGreaterThan(0);

    expect(typeof siteMetadata.author).toBe('string');
    expect(siteMetadata.author.length).toBeGreaterThan(0);

    expect(typeof siteMetadata.url).toBe('string');
    expect(siteMetadata.url.startsWith('http')).toBe(true);

    expect(typeof siteMetadata.jobTitle).toBe('string');
    expect(siteMetadata.jobTitle.length).toBeGreaterThan(0);

    expect(typeof siteMetadata.personDescription).toBe('string');
    expect(siteMetadata.personDescription.length).toBeGreaterThan(0);

    expect(typeof siteMetadata.image).toBe('string');
    expect(siteMetadata.image.startsWith('/')).toBe(true);
  });

  it('should have exact seo identity fields', () => {
    expect(siteMetadata.title).toBe('Adrian Lumley | AI Diligence Analyst and Product Leader');
    expect(siteMetadata.siteName).toBe('Adrian Lumley');
    expect(siteMetadata.jobTitle).toBe('AI Diligence Analyst');
    expect(siteMetadata.personDescription).toBe('Enterprise product leader and independent AI diligence analyst. Creator of The Trust Layer.');
    expect(siteMetadata.alumniOf).toEqual([
      "St. John's University",
      'Quantic School of Business and Technology',
    ]);
    expect(siteMetadata.knowsAbout).toEqual([
      'AI evaluation',
      'AI diligence',
      'Product management',
      'Enterprise software',
      'AI agents',
    ]);
    expect(siteMetadata.social).toEqual([
      'https://www.linkedin.com/in/adrianlumley/',
      'https://github.com/prime3679',
    ]);
    expect(siteMetadata.image).toBe('/images/adrian-lumley.jpg');
  });

  it('should have a valid social array with URLs', () => {
    expect(Array.isArray(siteMetadata.social)).toBe(true);
    expect(siteMetadata.social.length).toBeGreaterThan(0);

    siteMetadata.social.forEach((url) => {
      expect(typeof url).toBe('string');
      expect(url.startsWith('https://')).toBe(true);
    });
  });

  it('should contain correct specific literal values for key identifying fields', () => {
    expect(siteMetadata.author).toBe('Adrian Lumley');
    expect(siteMetadata.url).toBe('https://adrianlumley.co');
  });
});
