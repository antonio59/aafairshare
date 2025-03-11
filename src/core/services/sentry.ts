import * as Sentry from '@sentry/react';
import { browserTracingIntegration, replayIntegration } from '@sentry/react';

/**
 * Initializes Sentry error tracking with the provided DSN
 * Must be called before rendering the React application
 */
export function initSentry(): void {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        browserTracingIntegration(),
        replayIntegration(),
      ],
      // Performance monitoring - adjust the sample rate as needed (0.0 to 1.0)
      tracesSampleRate: 0.1,
      // Session replay for errors - adjust as needed
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      // Environment setting
      environment: import.meta.env.MODE,
      // Release identifier - use your version from package.json
      release: import.meta.env.VITE_APP_VERSION || 'dev',
      // Only enable Sentry in production
      enabled: import.meta.env.PROD,
    });
  }
}

/**
 * Captures exceptions and sends them to Sentry
 * @param error The error to capture
 * @param context Optional additional context data
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Error captured (would be sent to Sentry in production):', error);
    if (context) {
      console.error('Additional context:', context);
    }
  }
}

/**
 * Manually captures a message to Sentry
 * @param message The message to capture
 * @param level The severity level
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info'
): void {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`Message captured (${level}):`, message);
  }
}

/**
 * Sets user information for Sentry events
 * @param user The user information
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  Sentry.setUser(user);
}

/**
 * Error boundary component for React
 * Wrap your components to catch and report rendering errors
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary; 