// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://adrianlumley.co',
  // /now was retired; keep old links alive.
  redirects: { '/now': '/' },
  integrations: [tailwind(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
