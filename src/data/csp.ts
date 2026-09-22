// content security policy for the base document shell.
//
// kept as a single source of truth so it can be regression tested. the
// script-src allows umami analytics and cloudflare's automatically injected
// web analytics beacon (served from static.cloudflareinsights.com). connect-src
// keeps the umami collection hosts, the cloudflare insights rum host, and the
// opt-in rogue status origin so the dormant status endpoint can be re-enabled
// without loosening policy later. auto-inject posts to same-origin /cdn-cgi/rum
// ('self'); the beacon and current cf docs also collect at
// https://cloudflareinsights.com/cdn-cgi/rum for the version-less / manual path.
export const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cloud.umami.is https://static.cloudflareinsights.com",
  "connect-src 'self' https://cloud.umami.is https://gateway.umami.is https://cloudflareinsights.com https://api.adrianlumley.co",
  "style-src 'self' 'unsafe-inline'",
  "form-action 'self' https://formspree.io",
  "object-src 'none'",
  "base-uri 'self'",
  'upgrade-insecure-requests',
].join('; ');
