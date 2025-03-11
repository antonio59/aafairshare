import { captureException, captureMessage } from '@/core/services/sentry';
import { trackUserAction, startTransaction } from '@/core/services/sentry-utils';

/**
 * Test utility for Sentry integration
 * Only use this in development to verify Sentry is working correctly
 */
export function testSentryIntegration(): void {
  console.log('Testing Sentry integration...');

  // Test breadcrumb tracking
  trackUserAction('test.sentry.started', {
    timestamp: new Date().toISOString(),
  });

  // Test message capture
  captureMessage('Test message from the Expense Sharing App', 'info');
  
  // Test transaction tracking
  const transaction = startTransaction('test-transaction', 'test');
  
  // Add spans to the transaction
  const span1 = transaction.startChild({
    op: 'test.step1',
    description: 'First test step',
  });
  
  setTimeout(() => {
    span1.finish();
    
    const span2 = transaction.startChild({
      op: 'test.step2',
      description: 'Second test step',
    });
    
    setTimeout(() => {
      span2.finish();
      transaction.finish();
      
      // Finally, test error capture
      try {
        throw new Error('Test error for Sentry');
      } catch (error) {
        if (error instanceof Error) {
          captureException(error, {
            testInfo: 'This is a test error to verify Sentry integration',
          });
        }
      }
      
      console.log('Sentry tests complete. Check your Sentry dashboard.');
    }, 500);
  }, 500);
} 