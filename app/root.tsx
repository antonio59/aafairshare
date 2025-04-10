import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useEffect, useState } from "react";
import { AuthProvider } from "~/contexts/AuthContext";
import { Toaster } from "~/components/ui/toaster";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://rsms.me/inter/inter.css",
  },
  { rel: "manifest", href: "/manifest.json" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="description" content="Split expenses fairly with your household members" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AAFairShare" />
        <title>AAFairShare | Household Expenses Management</title>
        <Meta />
        <Links />
        {/* Firebase will be initialized via client-side imports */}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <script dangerouslySetInnerHTML={{ __html: `
          // Apply dark mode immediately based on user preference
          if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }

          // Add global error handler
          window.handleReactError = function(error) {
            console.error('React Error Handler:', error);
            // Get the error container rendered by React's FallbackComponent
            var errorContainer = document.getElementById('root-error-messages');
            // Do not create/append the container here; rely on React rendering it.

            var errorElement = document.createElement('div');
            errorElement.innerHTML = '<h3 style="margin-top: 10px; color: red;">Error:</h3><pre style="white-space: pre-wrap; overflow: auto; max-height: 200px; padding: 10px; background-color: #f5f5f5;">' + error.message + '\n' + (error.stack || '') + '</pre>';

            // Ensure errorContainer exists and is in the DOM before appending
            // Only append the error message if the container exists
            if (errorContainer) {
              errorContainer.appendChild(errorElement);
            } else {
              // Log if container couldn't be found (React might not have rendered it yet or it failed)
              console.error("Could not find #root-error-messages container to display message.");
            }
          };

          // Add debug info to window
          window.debugInfo = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            errors: []
          };
        ` }} />
      </body>
    </html>
  );
}

// Loader function to pass environment variables to the client
export const loader: LoaderFunction = async () => {
  return json({
    ENV: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
    },
  });
};

export default function App() {
  const data = useLoaderData<typeof loader>();
  const [isClient, setIsClient] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  // First effect: Handle client-side initialization
  useEffect(() => {
    try {
      console.log('Root component mounted');
      setIsClient(true);

      // Client is ready
      console.log('Client is ready');
      // Firebase initialization state will be managed by AuthProvider or similar
      // For now, assume initialized if client is ready (will refine later)
      setFirebaseInitialized(true);
    } catch (error) {
      console.error('Error in root component initialization:', error);
      setInitError(error instanceof Error ? error : new Error(String(error)));
    }
  }, []); // Empty dependency array - run once on mount

  // Second effect: Handle ENV setup and service worker
  useEffect(() => {
    if (!isClient) return; // Only run on client

    try {
      // Make environment variables available to the client if not already set
      if (data && data.ENV && typeof window !== 'undefined' && !window.ENV) {
        window.ENV = data.ENV;
        console.log('ENV set from loader data');
      } else if (typeof window !== 'undefined' && window.ENV) {
        console.log('ENV already set in window');
      } else if (data && !data.ENV) {
        console.error('ENV data is missing in loader data');
        // Consider setting an error state here if ENV is critical
        // setInitError(new Error('ENV data is missing in loader data'));
      }

      // Register service worker only in production
      if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
              console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
              console.error('ServiceWorker registration failed: ', error);
            });
        });
      }
    } catch (error) {
      console.error('Error in root useEffect:', error);
      setInitError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [data, isClient]); // Removed Firebase initialization logic

  // Add a simple fallback component
  const FallbackComponent = ({ error }: { error?: Error | null }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ marginBottom: '20px', fontSize: '24px' }}>AAFairShare</h1>
      {error ? (
        <>
          <p style={{ marginBottom: '20px', color: 'red' }}>Error loading application</p>
          <pre style={{
            whiteSpace: 'pre-wrap',
            overflow: 'auto',
            maxHeight: '200px',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            textAlign: 'left',
            width: '100%',
            maxWidth: '600px',
            borderRadius: '4px'
          }}>
            {error.message}
          </pre>
        </>
      ) : (
        <p style={{ marginBottom: '20px' }}>Loading application...</p>
      )}
      <div style={{ color: 'red', marginTop: '20px' }} id="root-error-messages"></div>
    </div>
  );

  // Add error boundary
  try {
    // If there's an initialization error, show it
    if (initError) {
      return <FallbackComponent error={initError} />;
    }

    // Show loading state if Firebase is not initialized yet
    if (isClient && !firebaseInitialized) {
      return (
        <Layout>
          <FallbackComponent />
        </Layout>
      );
    }

    return (
      <Layout>
        <AuthProvider>
          <Outlet />
          <Toaster />
        </AuthProvider>
      </Layout>
    );
  } catch (error) {
    console.error('Root render error:', error);
    return <FallbackComponent error={error instanceof Error ? error : new Error(String(error))} />;
  }
}
