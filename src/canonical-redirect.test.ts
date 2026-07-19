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

  it('falls through to assets for canonical requests', async () => {
    const assetResponse = new Response('ok');
    const assetFetch = vi.fn().mockResolvedValue(assetResponse);

    const response = await handleCanonicalAssetRequest(
      new Request('https://adrianlumley.co/work/'),
      { ASSETS: { fetch: assetFetch } },
    );

    expect(response).toBe(assetResponse);
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
    expect(canonical).toBe(assetResponse);
    expect(assetFetch).toHaveBeenCalledTimes(1);
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
