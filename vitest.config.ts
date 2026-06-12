/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'happy-dom',
    // Unit tests live in src/; tests/ holds Playwright specs that must never
    // be collected by Vitest (they fail when imported outside playwright).
    include: ['src/**/*.test.ts'],
  },
});
