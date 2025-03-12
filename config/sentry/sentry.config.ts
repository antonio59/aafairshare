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

// Base Sentry configuration
export const sentryConfig: SentryConfig = {
  dsn: process.env.VITE_SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  release: `v${process.env.npm_package_version}`,
  tracesSampleRate: 1.0,
  attachStacktrace: true,
};

// Sentry authentication configuration
export const sentryAuthConfig: SentryAuthConfig = {
  authToken: process.env.SENTRY_AUTH_TOKEN || '',
  org: 'antonio59',
  project: 'aafairshare',
};
