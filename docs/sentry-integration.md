# Sentry Integration

This document outlines the Sentry error tracking and monitoring integration in the Expense Sharing App.

## Overview

Sentry provides real-time error tracking, performance monitoring, and user session tracking for our application. It helps identify issues in production, track their impact, and understand user interactions leading up to errors.

## Setup and Configuration

### Environment Variables

The following environment variables need to be set in your `.env` file:

```
VITE_SENTRY_DSN=your_sentry_dsn
VITE_APP_VERSION=1.0.0
```

- `VITE_SENTRY_DSN`: Your Sentry project's Data Source Name (DSN)
- `VITE_APP_VERSION`: Application version (used for release tracking)

### Initial Setup

1. **Create a Sentry account and project**:
   - Go to [Sentry.io](https://sentry.io/)
   - Create a new React project
   - Copy the DSN provided

2. **Configure environment variables**:
   - Add the DSN to your `.env` file
   - Set the current version of your application

3. **Deploy with Sentry enabled**:
   - Sentry is only fully enabled in production builds
   - In development, errors are logged to the console instead

## Key Features

### Error Tracking

The application uses Sentry for automatic error tracking with:

- Unhandled exceptions capture
- React error boundary integration
- Manual error reporting API
- Breadcrumb tracking for context

### Performance Monitoring

Performance monitoring tracks:

- Page load times
- Navigation transitions
- API call durations
- Long-running operations

### Session Replay

For critical errors, Sentry can capture session replays that show:

- User interactions before an error
- DOM state at time of error
- Console logs and network requests

## Usage in Codebase

### Error Boundaries

The application is wrapped with a Sentry Error Boundary:

```tsx
import { ErrorBoundary } from '@/core/components/ErrorBoundary';

// In App.tsx
return (
  <ErrorBoundary>
    <Application />
  </ErrorBoundary>
);
```

### Manual Error Reporting

```tsx
import { captureException } from '@/core/services/sentry';

try {
  // Risky operation
} catch (error) {
  captureException(error, {
    context: 'Expense creation',
    expenseData: { amount, description }
  });
  showErrorToUser('Could not create expense');
}
```

### User Identification

```tsx
import { identifyUser, clearUserIdentity } from '@/core/services/sentry-utils';

// After successful login
identifyUser(user.id, user.email);

// On logout
clearUserIdentity();
```

### Performance Tracking

```tsx
import { startTransaction } from '@/core/services/sentry-utils';

async function fetchExpenses() {
  const transaction = startTransaction('fetchExpenses', 'data-loading');
  
  try {
    // Fetch data...
    return data;
  } finally {
    transaction.finish();
  }
}
```

### User Action Tracking

```tsx
import { trackUserAction } from '@/core/services/sentry-utils';

function handleCreateExpense(expenseData) {
  trackUserAction('expense.create.started', { 
    amount: expenseData.amount,
    hasAttachments: expenseData.files.length > 0
  });
  
  // Continue with expense creation...
}
```

## Best Practices

1. **Error Context**: Always provide additional context when manually reporting errors
2. **PII Handling**: Never include personally identifiable information (PII) in error reports
3. **Performance Impact**: Use performance monitoring judiciously to avoid overhead
4. **Error Grouping**: Use structured error messages for better error grouping in Sentry dashboard

## Troubleshooting

### Common Issues

1. **Errors not showing in Sentry**:
   - Verify DSN is correctly set in environment variables
   - Check that Sentry initialization occurs before app rendering
   - Verify errors are not caught and suppressed elsewhere

2. **Too many errors reported**:
   - Implement better error handling for expected failures
   - Add ignore rules for non-actionable errors

3. **Performance degradation**:
   - Adjust sampling rates for performance monitoring
   - Update to latest Sentry SDK version

## Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Performance Monitoring Guide](https://docs.sentry.io/product/performance/)
- [Session Replay Documentation](https://docs.sentry.io/product/session-replay/) 