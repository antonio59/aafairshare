/**
 * Sentry Configuration
 * This module exports configuration for Sentry error tracking
 */

interface SentryConfig {
  dsn: string;
  environment: string;
  release: string;
  tracesSampleRate: number;
  attachStacktrace: boolean;
}

interface SentryAuthConfig {
  authToken: string;
  org: string;
  project: string;
}

/**
 * Load environment variables with validation
 * @returns Validated environment configuration
 */
function loadEnvironment() {
  const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONITORING_DSN: process.env.VITE_SENTRY_DSN,
    AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    ORG_ID: process.env.SENTRY_ORG || 'antonio59',
    PROJECT_ID: process.env.SENTRY_PROJECT || 'aafairshare',
    APP_VERSION: process.env.npm_package_version || '0.0.0',
  };

  // Validate required variables
  const missingVars = Object.entries(env)
    .filter(([key, value]) => !value && key !== 'NODE_ENV')
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return env;
}

// Load and validate environment
const env = loadEnvironment();

// Base Sentry configuration
export const sentryConfig: SentryConfig = {
  dsn: env.MONITORING_DSN!,
  environment: env.NODE_ENV,
  release: `v${env.APP_VERSION}`,
  tracesSampleRate: 1.0,
  attachStacktrace: true,
};

// Sentry authentication configuration
export const sentryAuthConfig: SentryAuthConfig = {
  authToken: env.AUTH_TOKEN!,
  org: env.ORG_ID,
  project: env.PROJECT_ID,
};
