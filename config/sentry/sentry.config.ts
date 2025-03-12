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
 * Load and validate environment variables
 * @returns Validated environment configuration
 */
function loadEnvironment() {
  // Required environment variables
  const requiredVars = {
    dsn: process.env.VITE_SENTRY_DSN,
    token: process.env.SENTRY_AUTH_TOKEN,
  };

  // Optional environment variables with defaults
  const optionalVars = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    ORG_ID: process.env.SENTRY_ORG || 'antonio59',
    PROJECT_ID: process.env.SENTRY_PROJECT || 'aafairshare',
    APP_VERSION: process.env.npm_package_version || '0.0.0',
  };

  // Validate required variables
  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.map(v => `  - ${v}`).join('\n')}`
    );
  }

  // Combine and return validated environment
  return {
    ...requiredVars,
    ...optionalVars,
  } as const;
}

// Load and validate environment
const env = loadEnvironment();

// Base Sentry configuration
export const sentryConfig: SentryConfig = {
  dsn: env.dsn!,
  environment: env.NODE_ENV,
  release: `v${env.APP_VERSION}`,
  tracesSampleRate: 1.0,
  attachStacktrace: true,
};

// Sentry authentication configuration
export const sentryAuthConfig: SentryAuthConfig = {
  authToken: env.token!,
  org: env.ORG_ID,
  project: env.PROJECT_ID,
};
