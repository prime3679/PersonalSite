import { describe, it, expect } from 'vitest';
import { siteMetadata } from './siteMetadata';

describe('siteMetadata', () => {
  it('should exist and be an object', () => {
    expect(siteMetadata).toBeDefined();
    expect(typeof siteMetadata).toBe('object');
    expect(siteMetadata).not.toBeNull();
  });

  it('should have all required base string fields', () => {
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
  });

  it('should have a valid worksFor object', () => {
    expect(siteMetadata.worksFor).toBeDefined();
    expect(typeof siteMetadata.worksFor).toBe('object');
    expect(typeof siteMetadata.worksFor.name).toBe('string');
    expect(siteMetadata.worksFor.name.length).toBeGreaterThan(0);
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
    // These are unlikely to change and are core to the site's identity.
    expect(siteMetadata.author).toBe('Adrian Lumley');
    expect(siteMetadata.title).toBe('Adrian Lumley');
    expect(siteMetadata.url).toBe('https://adrianlumley.co');
  });
});
