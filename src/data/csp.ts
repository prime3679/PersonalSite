// content security policy for the base document shell.
//
// kept as a single source of truth so it can be regression tested. the
// script-src allows umami analytics and cloudflare's automatically injected
// web analytics beacon (served from static.cloudflareinsights.com). connect-src
// keeps the umami collection hosts and the opt-in rogue status origin so the
// dormant status endpoint can be re-enabled without loosening policy later.
export const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cloud.umami.is https://static.cloudflareinsights.com",
  "connect-src 'self' https://cloud.umami.is https://gateway.umami.is https://api.adrianlumley.co",
  "style-src 'self' 'unsafe-inline'",
  "form-action 'self' https://formspree.io",
  "object-src 'none'",
  "base-uri 'self'",
  'upgrade-insecure-requests',
].join('; ');
