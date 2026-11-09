import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    // Desktop engines run the full suite except the mobile-only specs.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/mobile/**',
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: '**/mobile/**',
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: '**/mobile/**',
    },
    // Touch viewports run only the mobile specs: the 320 to 414px width
    // sweeps for the record, the header row, and essay overflow.
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: '**/mobile/**',
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
      testMatch: '**/mobile/**',
    },
  ],
  webServer: {
    // Test the built output, not the dev server: it's what actually deploys,
    // and it avoids dev-mode lazy route compilation flaking parallel runs.
    // --ignore-lock keeps the server in the foreground: astro 7.4+ moves
    // preview to a background process when a coding agent runs it, and the
    // foreground command exiting reads as a crashed server here.
    command: 'npm run build && npm run preview -- --ignore-lock',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
