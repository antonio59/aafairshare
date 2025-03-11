import * as Sentry from '@sentry/react';
import { setUser } from './sentry';

/**
 * Track a user action in Sentry
 * @param action The action name
 * @param data Additional data to track with the action
 */
export function trackUserAction(
  action: string, 
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    category: 'user-action',
    message: action,
    level: 'info',
    data
  });
}

/**
 * Start a Sentry transaction for performance monitoring
 * @param name Transaction name
 * @param operation Operation type
 * @returns Transaction object that should be finished when operation completes
 */
export function startTransaction(
  name: string, 
  operation: string
): Sentry.Transaction {
  const transaction = Sentry.startTransaction({
    name,
    op: operation,
  });
  
  // Set the current transaction as the current span for automatic child spans
  Sentry.configureScope(scope => {
    scope.setSpan(transaction);
  });
  
  return transaction;
}

/**
 * Track user identification in Sentry
 * @param userId User ID
 * @param email Optional user email
 * @param username Optional username
 */
export function identifyUser(
  userId: string, 
  email?: string, 
  username?: string
): void {
  setUser({
    id: userId,
    ...(email && { email }),
    ...(username && { username }),
  });

  // Add a breadcrumb for the identification
  Sentry.addBreadcrumb({
    category: 'auth',
    message: 'User identified',
    level: 'info',
  });
}

/**
 * Clear user identification in Sentry (on logout)
 */
export function clearUserIdentity(): void {
  setUser(null);
  
  // Add a breadcrumb for the logout
  Sentry.addBreadcrumb({
    category: 'auth',
    message: 'User logged out',
    level: 'info',
  });
} 