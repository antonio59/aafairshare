/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser, useLocation, useMatches } from "@remix-run/react";
import { startTransition, StrictMode, useState, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";

// Define the future configuration to prevent errors
if (typeof window !== 'undefined' && !window.ENV) {
  window.ENV = {
    FIREBASE_API_KEY: '',
    FIREBASE_AUTH_DOMAIN: '',
    FIREBASE_PROJECT_ID: '',
    FIREBASE_STORAGE_BUCKET: '',
    FIREBASE_MESSAGING_SENDER_ID: '',
    FIREBASE_APP_ID: '',
  };
}

// Add a polyfill for the missing future property
if (typeof window !== 'undefined' && window.__remixContext && !window.__remixContext.future) {
  window.__remixContext.future = {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
    v3_singleFetch: true,
    v3_lazyRouteDiscovery: true,
  };
}

// Add error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (hasError && error && typeof window !== 'undefined' && window.handleReactError) {
      window.handleReactError(error);
    }
  }, [hasError, error]);

  if (hasError) {
    return (
      <div style={{
        padding: '20px',
        margin: '20px',
        border: '1px solid red',
        borderRadius: '5px',
        backgroundColor: '#fff8f8'
      }}>
        <h2>Something went wrong</h2>
        <p>An error occurred while loading the application.</p>
        {error && (
          <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '200px', padding: '10px', backgroundColor: '#f5f5f5' }}>
            {error.message}
          </pre>
        )}
      </div>
    );
  }

  try {
    return <>{children}</>;
  } catch (e) {
    setError(e instanceof Error ? e : new Error(String(e)));
    setHasError(true);
    return null;
  }
}

// Define the window.ENV and window.firebase types
declare global {
  interface Window {
    ENV: {
      FIREBASE_API_KEY: string;
      FIREBASE_AUTH_DOMAIN: string;
      FIREBASE_PROJECT_ID: string;
      FIREBASE_STORAGE_BUCKET: string;
      FIREBASE_MESSAGING_SENDER_ID: string;
      FIREBASE_APP_ID: string;
      FIREBASE_MEASUREMENT_ID?: string;
    };
    firebase: any; // Using any for simplicity
    handleReactError: (error: Error) => void;
    debugInfo?: any;
    queryClient?: any;
    __remixContext?: any; // Add this to handle the future property
  }
}

// Add global error handler to window
if (typeof window !== 'undefined' && !window.handleReactError) {
  window.handleReactError = (error: Error) => {
    console.error('React Error Handler:', error);
    // Add error to DOM for visibility
    const errorContainer = document.getElementById('root-error-messages') || document.createElement('div');
    if (!errorContainer.id) {
      errorContainer.id = 'root-error-messages';
      errorContainer.style.padding = '20px';
      errorContainer.style.margin = '20px';
      errorContainer.style.border = '1px solid red';
      errorContainer.style.borderRadius = '5px';
      errorContainer.style.backgroundColor = '#fff8f8';
      document.body.appendChild(errorContainer);
    }

    const errorElement = document.createElement('div');
    errorElement.innerHTML = `
      <h3 style="margin-top: 10px; color: red;">Error:</h3>
      <pre style="white-space: pre-wrap; overflow: auto; max-height: 200px; padding: 10px; background-color: #f5f5f5;">
        ${error.message}
        ${error.stack || ''}
      </pre>
    `;
    errorContainer.appendChild(errorElement);
  };
}

// Wrap the RemixBrowser in our ErrorBoundary
function App() {
  return (
    <ErrorBoundary>
      <RemixBrowser />
    </ErrorBoundary>
  );
}

// Add error handling to hydration
try {
  console.log('Starting hydration...');
  startTransition(() => {
    try {
      hydrateRoot(
        document,
        <StrictMode>
          <App />
        </StrictMode>
      );
      console.log('Hydration complete');
    } catch (error) {
      console.error('Hydration error:', error);
      if (typeof window !== 'undefined' && window.handleReactError) {
        window.handleReactError(error instanceof Error ? error : new Error(String(error)));
      }

      // Fallback to a simple message if hydration fails
      document.body.innerHTML = `
        <div style="padding: 20px; margin: 20px; border: 1px solid red; border-radius: 5px; background-color: #fff8f8;">
          <h2>Failed to load application</h2>
          <p>There was an error loading the application. Please try refreshing the page.</p>
          <pre style="white-space: pre-wrap; overflow: auto; max-height: 200px; padding: 10px; background-color: #f5f5f5;">
            ${error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      `;
    }
  });
} catch (error) {
  console.error('Fatal error during initialization:', error);
  if (typeof window !== 'undefined' && window.handleReactError) {
    window.handleReactError(error instanceof Error ? error : new Error(String(error)));
  }
}
