const CANONICAL_ORIGIN = 'https://adrianlumley.co';
const CANONICAL_HOSTNAME = 'adrianlumley.co';
const CANONICAL_ROOT_URL = `${CANONICAL_ORIGIN}/`;

export function normalizeCanonicalPath(pathname) {
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

export function getCanonicalRedirectUrl(input) {
  const currentUrl = input instanceof URL ? input : new URL(input);
  const canonicalUrl = new URL(currentUrl.toString());

  canonicalUrl.protocol = 'https:';
  canonicalUrl.hostname = CANONICAL_HOSTNAME;
  canonicalUrl.port = '';
  canonicalUrl.pathname = normalizeCanonicalPath(currentUrl.pathname);

  const needsRedirect =
    canonicalUrl.protocol !== currentUrl.protocol ||
    canonicalUrl.hostname !== currentUrl.hostname ||
    canonicalUrl.port !== currentUrl.port ||
    canonicalUrl.pathname !== currentUrl.pathname;

  if (!needsRedirect) {
    return null;
  }

  canonicalUrl.search = currentUrl.search;
  canonicalUrl.hash = currentUrl.hash;

  return canonicalUrl.toString();
}

export async function handleCanonicalAssetRequest(request, env) {
  const redirectUrl = getCanonicalRedirectUrl(request.url);

  if (redirectUrl) {
    return Response.redirect(redirectUrl, 308);
  }

  return env.ASSETS.fetch(request);
}

export function createCanonicalRedirectResponse(request) {
  const redirectUrl = getCanonicalRedirectUrl(request.url) ?? CANONICAL_ROOT_URL;
  return Response.redirect(redirectUrl, 308);
}
