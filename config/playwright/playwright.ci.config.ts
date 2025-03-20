/**
 * CI-specific Playwright configuration
 * 
 * This configuration extends the base configuration with CI-specific settings
 */

import { createPlaywrightConfig } from '../test/base.config';

export default createPlaywrightConfig({
  // CI-specific reporter settings
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  // File pattern for tests
  testMatch: '**/*.e2e.spec.ts',
});