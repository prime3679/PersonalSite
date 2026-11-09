// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://adrianlumley.co',
  // Preserve Astro 5's whitespace behavior while moving to Astro 7.
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
  },
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
