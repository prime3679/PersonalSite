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

// conservative transport and framing hardening applied to asset responses.
// intentionally narrow: no global permissions-policy and no response csp (the
// document-level csp is owned by src/data/csp.ts).
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
};

export function withSecurityHeaders(response) {
  // response headers from ASSETS.fetch can be immutable, so rebuild the
  // response while preserving status, body, and the original headers.
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function handleCanonicalAssetRequest(request, env) {
  const redirectUrl = getCanonicalRedirectUrl(request.url);

  if (redirectUrl) {
    return Response.redirect(redirectUrl, 308);
  }

  const assetResponse = await env.ASSETS.fetch(request);
  return withSecurityHeaders(assetResponse);
}

export function createCanonicalRedirectResponse(request) {
  const redirectUrl = getCanonicalRedirectUrl(request.url) ?? CANONICAL_ROOT_URL;
  return Response.redirect(redirectUrl, 308);
}
