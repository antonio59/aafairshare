import { defineConfig, devices } from '@playwright/test';

// Read environment variables, with fallbacks for local development
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const CI = process.env.CI === 'true';

console.log(`Playwright configuration using BASE_URL: ${BASE_URL}`);
console.log(`CI mode: ${CI ? 'Yes' : 'No'}`);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Add additional options for more consistent CI testing
    navigationTimeout: 60000, // Longer timeout for navigation
    actionTimeout: 30000,    // Longer timeout for actions
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    // In CI, only run Chromium tests to save time
    ...(CI ? [] : [
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] }
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] }
      },
      {
        name: 'Mobile Chrome',
        use: { ...devices['Pixel 5'] }
      },
      {
        name: 'Mobile Safari',
        use: { ...devices['iPhone 12'] }
      }
    ])
  ],
  // Don't start a local dev server in CI - we're testing against the deployed app
  webServer: CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !CI,
    stdout: 'pipe',
    stderr: 'pipe'
  }
}); 