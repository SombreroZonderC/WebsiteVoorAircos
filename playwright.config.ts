import { defineConfig, devices } from '@playwright/test';

// Tests draaien tegen de gebouwde site (npm run build) via een eenvoudige statische server.
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4322' },
  webServer: {
    command: 'node scripts/serve-dist.mjs',
    url: 'http://localhost:4322',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobiel', use: { ...devices['Pixel 7'] } },
  ],
});
