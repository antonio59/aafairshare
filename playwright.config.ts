import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'html' : 'list',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    // Unit tests
    {
      name: 'unit',
      testDir: './src/tests/unit',
    },

    // E2E tests - Desktop Chrome
    {
      name: 'e2e-chrome',
      testDir: './e2e',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },

    // E2E tests - Desktop Firefox
    {
      name: 'e2e-firefox',
      testDir: './e2e',
      use: { 
        ...devices['Desktop Firefox'],
      },
    },

    // E2E tests - Mobile Chrome
    {
      name: 'e2e-mobile-chrome',
      testDir: './e2e',
      use: { 
        ...devices['Pixel 5'],
      },
    },

    // E2E tests - Mobile Safari
    {
      name: 'e2e-mobile-safari',
      testDir: './e2e',
      use: { 
        ...devices['iPhone 12'],
      },
    },
  ],
});
