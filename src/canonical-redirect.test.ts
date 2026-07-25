import { describe, expect, it, vi } from 'vitest';
import {
  createCanonicalRedirectResponse,
  getCanonicalRedirectUrl,
  handleCanonicalAssetRequest,
} from './canonical-redirect.js';

describe('canonical redirect worker', () => {
  it('returns null for canonical requests', () => {
    expect(getCanonicalRedirectUrl('https://adrianlumley.co/work/')).toBeNull();
    expect(getCanonicalRedirectUrl('https://adrianlumley.co/sitemap.xml')).toBeNull();
  });

  it('normalizes protocol, host, and trailing slash while preserving query strings', () => {
    expect(getCanonicalRedirectUrl('http://www.adrianlumley.co/contact?sent=1')).toBe(
      'https://adrianlumley.co/contact/?sent=1',
    );
    expect(getCanonicalRedirectUrl('https://adrianlumley.co/signal-room/night-shift')).toBe(
      'https://adrianlumley.co/signal-room/night-shift/',
    );
  });

  it('redirects duplicate urls before asset lookup', async () => {
    const assetFetch = vi.fn();
    const response = await handleCanonicalAssetRequest(
      new Request('https://adrianlumley.co/work'),
      { ASSETS: { fetch: assetFetch } },
    );

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://adrianlumley.co/work/');
    expect(assetFetch).not.toHaveBeenCalled();
  });

  it('falls through to assets for canonical requests, preserving the asset body', async () => {
    const assetResponse = new Response('ok', { status: 200 });
    const assetFetch = vi.fn().mockResolvedValue(assetResponse);

    const response = await handleCanonicalAssetRequest(
      new Request('https://adrianlumley.co/work/'),
      { ASSETS: { fetch: assetFetch } },
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');
    expect(assetFetch).toHaveBeenCalledTimes(1);
  });

  it('redirects /about once and lets /about/ fall through to assets', async () => {
    const assetResponse = new Response('asset ok');
    const assetFetch = vi.fn().mockResolvedValue(assetResponse);

    const redirected = await handleCanonicalAssetRequest(
      new Request('https://adrianlumley.co/about'),
      { ASSETS: { fetch: assetFetch } },
    );
    expect(redirected.status).toBe(308);
    expect(redirected.headers.get('location')).toBe('https://adrianlumley.co/about/');
    expect(assetFetch).not.toHaveBeenCalled();

    const canonical = await handleCanonicalAssetRequest(
      new Request('https://adrianlumley.co/about/'),
      { ASSETS: { fetch: assetFetch } },
    );
    expect(canonical.status).toBe(200);
    expect(await canonical.text()).toBe('asset ok');
    expect(assetFetch).toHaveBeenCalledTimes(1);
  });

  it('adds conservative security headers to asset responses while preserving status, body, and existing headers', async () => {
    const assetResponse = new Response('page body', {
      status: 200,
      headers: { 'content-type': 'text/html', 'cache-control': 'public, max-age=3600' },
    });
    const assetFetch = vi.fn().mockResolvedValue(assetResponse);

    const response = await handleCanonicalAssetRequest(
      new Request('https://adrianlumley.co/work/'),
      { ASSETS: { fetch: assetFetch } },
    );

    expect(response.headers.get('strict-transport-security')).toBe('max-age=31536000');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-frame-options')).toBe('SAMEORIGIN');

    // original status, body, and pre-existing headers are preserved
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('page body');
    expect(response.headers.get('content-type')).toBe('text/html');
    expect(response.headers.get('cache-control')).toBe('public, max-age=3600');

    // no global permissions-policy or response csp is added
    expect(response.headers.get('permissions-policy')).toBeNull();
    expect(response.headers.get('content-security-policy')).toBeNull();
  });

  it('preserves a non-200 asset status while still adding security headers', async () => {
    const assetResponse = new Response('not found', { status: 404 });
    const assetFetch = vi.fn().mockResolvedValue(assetResponse);

    const response = await handleCanonicalAssetRequest(
      new Request('https://adrianlumley.co/missing/'),
      { ASSETS: { fetch: assetFetch } },
    );

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('not found');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('redirects www requests to the canonical host', () => {
    const response = createCanonicalRedirectResponse(
      new Request('https://www.adrianlumley.co/lab/ink-field?preview=1'),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe(
      'https://adrianlumley.co/lab/ink-field/?preview=1',
    );
  });
});
