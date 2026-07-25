import { describe, expect, it } from 'vitest';
import { CSP_POLICY } from './csp';

// parse a policy string into { directive: [sources...] }
function parseCsp(policy: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const part of policy.split(';')) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;
    const [name, ...sources] = tokens;
    out[name] = sources;
  }
  return out;
}

describe('base-page content security policy', () => {
  const directives = parseCsp(CSP_POLICY);

  it('permits the cloudflare web analytics beacon script origin', () => {
    expect(directives['script-src']).toContain('https://static.cloudflareinsights.com');
  });

  it('preserves the existing umami script allowances', () => {
    expect(directives['script-src']).toEqual(
      expect.arrayContaining(["'self'", "'unsafe-inline'", 'https://cloud.umami.is']),
    );
  });

  it('preserves the existing connect-src allowances, including umami and the opt-in status origin', () => {
    expect(directives['connect-src']).toEqual(
      expect.arrayContaining([
        "'self'",
        'https://cloud.umami.is',
        'https://gateway.umami.is',
        'https://api.adrianlumley.co',
      ]),
    );
  });

  it('preserves the remaining hardening directives unchanged', () => {
    expect(directives['default-src']).toEqual(["'self'"]);
    expect(directives['style-src']).toEqual(["'self'", "'unsafe-inline'"]);
    expect(directives['form-action']).toEqual(["'self'", 'https://formspree.io']);
    expect(directives['object-src']).toEqual(["'none'"]);
    expect(directives['base-uri']).toEqual(["'self'"]);
    expect(directives).toHaveProperty('upgrade-insecure-requests');
  });
});
