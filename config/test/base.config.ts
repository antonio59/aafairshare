// Ensure TypeScript uses correct module and target settings
/// <reference lib="es2015" />
/// <reference lib="dom" />

// Base configuration for testing
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
  ],
  outputDir: 'test-results',
  
  // Test retry settings
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: process.env.CI === 'true',
  
  // Projects configuration
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 }
      }
    }
  ]
};

// Helper function to create Playwright config
export function createPlaywrightConfig(config: any = {}): any {
  return {
    ...baseConfig,
    ...config
  };
}