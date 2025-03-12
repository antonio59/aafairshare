/**
 * Sentry Configuration Module
 * Provides type-safe configuration for Sentry error tracking
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

interface AppConfig {
  monitoring: {
    endpoint: string;
    credentials: string;
    environment: string;
    release: string;
    organization: string;
    project: string;
  };
}

/**
 * Load and validate application configuration
 * @returns Validated configuration
 * @throws Error if required variables are missing
 */
function loadAppConfig(): AppConfig {
  const config: AppConfig = {
    monitoring: {
      endpoint: process.env.VITE_SENTRY_DSN || '',
      credentials: process.env.SENTRY_AUTH_TOKEN || '',
      environment: process.env.NODE_ENV || 'development',
      release: `v${process.env.npm_package_version || '0.0.0'}`,
      organization: process.env.SENTRY_ORG || 'sentry',
      project: process.env.SENTRY_PROJECT || '4508958681661520',
    },
  };

  const { monitoring } = config;
  const missingVars = ['endpoint', 'credentials']
    .filter(key => !monitoring[key as keyof Pick<typeof monitoring, 'endpoint' | 'credentials'>]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required monitoring variables:\n${missingVars.map(v => `  - ${v}`).join('\n')}`
    );
  }

  return config;
}

// Load and validate configuration
const config = loadAppConfig();

// Base Sentry configuration
export const sentryConfig: SentryConfig = {
  dsn: config.monitoring.endpoint,
  environment: config.monitoring.environment,
  release: config.monitoring.release,
  tracesSampleRate: 1.0,
  attachStacktrace: true,
};

// Sentry authentication configuration
export const sentryAuthConfig: SentryAuthConfig = {
  authToken: config.monitoring.credentials,
  org: config.monitoring.organization,
  project: config.monitoring.project,
};
