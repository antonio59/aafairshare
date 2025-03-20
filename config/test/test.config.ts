import { createPlaywrightConfig } from './base.config';

// Export Playwright E2E test configuration
export const playwrightConfig = createPlaywrightConfig();

// Jest configuration is handled by jest.config.ts in the root directory
// This follows our TypeScript path alias configuration and testing standards