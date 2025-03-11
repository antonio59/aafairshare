/**
 * Sentry integration for application monitoring and error tracking
 */
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/browser';
import { getConfig, isFeatureEnabled } from './config';

interface SentryInitOptions {
  dsn?: string;
  environment?: string;
  tracesSampleRate?: number;
  debug?: boolean;
  ignoreErrors?: Array<string | RegExp>;
  allowUrls?: Array<string | RegExp>;
  denyUrls?: Array<string | RegExp>;
}

/**
 * Initialize Sentry for error tracking
 * This should be called as early as possible in the application
 */
export function initSentry() {
  const dsn = getConfig('sentryDsn');
  const environment = getConfig('sentryEnvironment') || getConfig('environment');
  const tracesSampleRate = getConfig('sentryTracesSampleRate');
  const isDebug = isFeatureEnabled('debugMode');
  
  // Only initialize if DSN is provided
  if (!dsn) {
    console.info('Sentry initialization skipped: No DSN provided');
    return;
  }
  
  // Configure Sentry options
  const options: SentryInitOptions = {
    dsn,
    environment,
    tracesSampleRate,
    debug: isDebug,
    ignoreErrors: [
      // Add patterns for errors you want to ignore
      /ResizeObserver loop limit exceeded/,
      /Network request failed/i,
      /Failed to fetch/i,
      /Load failed/i,
      /UnhandledRejection:/
    ],
    denyUrls: [
      // Add URLs or patterns for scripts that should not report errors
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
    ]
  };
  
  // Initialize Sentry with the options
  Sentry.init({
    ...options,
    integrations: [
      new BrowserTracing({
        // Set sampling based on environment
        tracingOrigins: ['localhost', /^\//]
      }),
      new Sentry.Replay({
        // Capture session replay for errors
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Capture 100% of errors in development, less in production
    replaysSessionSampleRate: getConfig('isProduction') ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      // Don't send events in development unless explicitly enabled
      if (getConfig('isDevelopment') && !isFeatureEnabled('sendErrorsInDevelopment')) {
        console.warn('Sentry error in development (not sent):', event);
        return null;
      }
      return event;
    }
  });
  
  // Set user information if available
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      Sentry.setUser({
        id: user.id,
        email: user.email
      });
    }
  } catch (e) {
    console.error('Error setting Sentry user:', e);
  }
  
  console.info(`Sentry initialized in ${environment} environment`);
}

/**
 * Capture an exception with Sentry
 * @param error - The error to capture
 * @param context - Additional context information
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (getConfig('isDevelopment')) {
    console.error('Error captured:', error, context);
  }
  Sentry.captureException(error, { extra: context });
}

/**
 * Capture a message with Sentry
 * @param message - The message to capture
 * @param level - The severity level
 * @param context - Additional context information
 */
export function captureMessage(
  message: string, 
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) {
  if (getConfig('isDevelopment')) {
    console.log(`[${level}] ${message}`, context);
  }
  Sentry.captureMessage(message, { 
    level,
    extra: context
  });
}

/**
 * Set extra context information for Sentry events
 * @param key - Context key
 * @param value - Context value
 */
export function setContext(key: string, value: Record<string, any>) {
  Sentry.setContext(key, value);
}

/**
 * Wrap a component with Sentry error boundary
 * @param component - React component to wrap
 * @param options - Error boundary options
 */
export function withErrorBoundary<P extends object>(
  component: React.ComponentType<P>,
  options?: Sentry.ErrorBoundaryOptions
) {
  return Sentry.withErrorBoundary(component, options);
}

export default {
  initSentry,
  captureException,
  captureMessage,
  setContext,
  withErrorBoundary
}; 