import { siteMetadata } from '../data/siteMetadata';

const canonicalSiteUrl = new URL(siteMetadata.url);

export function normalizeCanonicalPath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }

  const normalized = pathname.replace(/\/{2,}/g, '/');
  const hasFileExtension = /\/[^/]+\.[^/]+$/.test(normalized);

  if (hasFileExtension) {
    return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
  }

  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

export function canonicalUrl(input: string | URL): string {
  const url = typeof input === 'string'
    ? new URL(input, canonicalSiteUrl)
    : new URL(input.toString());

  url.protocol = canonicalSiteUrl.protocol;
  url.hostname = canonicalSiteUrl.hostname;
  url.port = '';
  url.pathname = normalizeCanonicalPath(url.pathname);
  url.search = '';
  url.hash = '';

  return url.toString();
}

export function absoluteUrl(pathname: string): string {
  return canonicalUrl(new URL(pathname, canonicalSiteUrl));
}
