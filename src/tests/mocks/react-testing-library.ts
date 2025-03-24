/**
 * Enhanced React Testing Library mock for React 19 compatibility
 * This provides a comprehensive solution for handling React 19 with testing-library
 */

import React, { Suspense } from 'react';
import type { ReactElement } from 'react';
import { render as originalRender, screen, fireEvent, within, act, cleanup, waitForElementToBeRemoved } from '@testing-library/react';
import type { RenderOptions, RenderResult } from '@testing-library/react';
import { waitFor as originalWaitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Default timeout for async operations (3 seconds)
const DEFAULT_TIMEOUT = 3000;

/**
 * Custom render function that properly handles React 19's concurrent rendering
 * and suppresses act() warnings
 */
function render(ui: ReactElement, options?: Omit<RenderOptions, 'queries'>): RenderResult {
  // Disable act warnings during render
  const originalError = console.error;
  console.error = (...args: Parameters<typeof console.error>) => {
    const errorMsg = typeof args[0] === 'string' ? args[0] : '';
    
    // Filter out common React 19 warnings
    if (errorMsg.includes('ReactDOMTestUtils.act') || 
        errorMsg.includes('React.act') || 
        errorMsg.includes('inside a test was not wrapped in act') ||
        errorMsg.includes('Warning: An update to') ||
        errorMsg.includes('was not wrapped in act')) {
      return;
    }
    originalError(...args);
  };

  // Create a wrapper component that provides all necessary context providers
  const TestWrapper = (props: { children: React.ReactNode }) => {
    return React.createElement(
      Suspense, 
      { 
        fallback: React.createElement('div', { 'data-testid': 'suspense-fallback' }, 'Loading...') 
      }, 
      props.children
    );
  };

  // Use our TestWrapper if no custom wrapper is provided
  const wrappedUI = options?.wrapper 
    ? ui 
    : React.createElement(TestWrapper, null, ui);

  // Render with the wrapped component
  const result = originalRender(wrappedUI, options);
  
  // Restore console.error
  console.error = originalError;
  
  return result;
};

/**
 * Enhanced waitFor that handles React 19 async rendering and concurrent mode
 * This version uses longer timeouts and more retries to accommodate React 19's rendering model
 */
const waitFor = async <T,>(callback: () => T | Promise<T>, options?: Parameters<typeof originalWaitFor>[1]): Promise<T> => {
  // Use more forgiving options for React 19's concurrent rendering
  const defaultOptions = { 
    timeout: DEFAULT_TIMEOUT,
    interval: 50,       // Check more frequently
    onTimeout: (error: Error) => {
      error.message = `Timed out in waitFor (React 19 compatibility mode)\n\n${error.message}`;
      return error;
    }
  };
  return originalWaitFor(callback, { ...defaultOptions, ...options });
};

// Export everything from RTL but override render and waitFor
export { render, waitFor };
export {
  screen,
  fireEvent,
  within,
  act,
  cleanup,
  waitForElementToBeRemoved,
  userEvent,
};
