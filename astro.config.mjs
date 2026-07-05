// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://adrianlumley.co',
  // /now was retired; keep old links alive.
  redirects: { '/now': '/' },
  integrations: [
    tailwind(),
    sitemap({
      // /blog and /blog/<slug> are meta-refresh stubs kept for old links;
      // crawlers should discover the /writing/ pages instead.
      filter: (page) => !/^\/blog(\/|$)/.test(new URL(page).pathname),
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
