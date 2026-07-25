// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://adrianlumley.co',
  // Preserve Astro 5's whitespace behavior while moving to Astro 7.
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      // /blog and /blog/<slug> are meta-refresh stubs kept for old links;
      // crawlers should discover the /writing/ pages instead.
      filter: (page) => !/^\/blog(\/|$)/.test(new URL(page).pathname),
    }),
  ],
  markdown: {
    // Keep the established remark/rehype rendering pipeline and output.
    processor: unified(),
    shikiConfig: {
      theme: 'github-dark',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
