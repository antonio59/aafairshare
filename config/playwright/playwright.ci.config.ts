/**
 * CI-specific Playwright configuration
 * 
 * This configuration is optimized for CI environments with:
 * - Reduced browser set (just Chromium)
 * - Increased timeouts for CI stability
 * - Simplified reporting
 * - Headless mode enforced
 */

import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Run tests in parallel to speed up execution
  workers: 2,
  
  // Forbid test.only to ensure all tests are run
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests in CI for stability
  retries: process.env.CI ? 2 : 0,
  
  // Reporter configuration for better CI output
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'] // Simple console reporter
  ],
  
  // Use minimal browser set for CI
  projects: [
    {
      name: 'chromium',
      use: {
        // Use Chrome browser for better CI compatibility
        browserName: 'chromium',
        // Run tests headless in CI
        headless: true,
        // Viewport size
        viewport: { width: 1280, height: 720 },
        // Ignore HTTPS errors for test environments
        ignoreHTTPSErrors: true,
        // Capture screenshot on failure
        screenshot: 'only-on-failure',
        // Capture traces on failure
        trace: 'retain-on-failure',
        // CI-specific timeouts
        navigationTimeout: 60000,
        actionTimeout: 30000,
        // Record videos only on failure in CI
        video: 'on-first-retry',
      },
    },
  ],
  
  // Shared settings for all tests
  use: {
    // Use base URL from environment if available
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    // Don't auto-install browsers

  },
  
  // File pattern for tests
  testMatch: '**/*.e2e.spec.ts',
  
  // Output directory for artifacts
  outputDir: 'test-results/',
  
  // Shared setup for all projects
  webServer: process.env.SKIP_WEB_SERVER === 'true' ? undefined : {
    command: 'npx vite preview --port 3000',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});