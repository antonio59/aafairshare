import type { PlaywrightTestConfig, ReporterDescription } from '@playwright/test';
import type { UserConfig } from 'vitest/config';

// Ensure TypeScript uses correct module and target settings
/// <reference lib="es2015" />
/// <reference lib="dom" />

// Base configuration shared between Vitest and Playwright
export const baseConfig = {
  // Environment variables
  CI: process.env.CI === 'true',
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  
  // Common timeouts
  navigationTimeout: 60000,
  actionTimeout: 30000,
  
  // Reporting settings
  reporters: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ] as ReporterDescription[],
  outputDir: 'test-results',
  
  // Test retry settings
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  
  // Browser settings for Playwright
  browser: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  
  // Test artifacts
  artifacts: {
    screenshot: 'only-on-failure' as const,
    trace: 'retain-on-failure' as const,
    video: 'on-first-retry' as const,
  },
};

// Helper function to create Playwright config
export function createPlaywrightConfig(config: Partial<PlaywrightTestConfig> = {}): PlaywrightTestConfig {
  return {
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: baseConfig.CI,
    retries: baseConfig.retries,
    workers: baseConfig.workers,
    reporter: [
      ['html', { open: 'never' }],
      ['list'],
      ['json', { outputFile: 'test-results/results.json' }]
    ] as ReporterDescription[],
    outputDir: baseConfig.outputDir,
    use: {
      baseURL: baseConfig.BASE_URL,
      ...baseConfig.browser,
      ...baseConfig.artifacts,
      navigationTimeout: baseConfig.navigationTimeout,
      actionTimeout: baseConfig.actionTimeout,
    },
    projects: [
      {
        name: 'chromium',
        use: { browserName: 'chromium' },
      },
    ],
    webServer: process.env.SKIP_WEB_SERVER === 'true' ? undefined : {
      command: 'npx vite preview --port 3000',
      port: 3000,
      reuseExistingServer: !baseConfig.CI,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    ...config,
  };
}

// Helper function to create Vitest config
export function createVitestConfig(config: Partial<UserConfig> = {}): UserConfig {
  return {
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
    ...config,
  };
}