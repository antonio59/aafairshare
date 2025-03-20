import { createVitestConfig, createPlaywrightConfig } from './base.config';

// Export configurations using the base config helpers
export const vitestConfig = createVitestConfig();
export const playwrightConfig = createPlaywrightConfig();