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
        {/* Firebase SDK - Load before React */}
        <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
        <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
        <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
        <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-functions-compat.js"></script>

        {/* Ensure Firebase is loaded */}
        <script dangerouslySetInnerHTML={{ __html: `
          // Check if Firebase SDK is loaded
          if (typeof firebase === 'undefined') {
            console.error('Firebase SDK is not loaded!');
          } else {
            console.log('Firebase SDK is loaded successfully');

            // Check if Firebase services are available
            if (typeof firebase.auth !== 'function') {
              console.error('Firebase Auth is not available!');
            } else {
              console.log('Firebase Auth is available');
            }

            if (typeof firebase.firestore !== 'function') {
              console.error('Firebase Firestore is not available!');
            } else {
              console.log('Firebase Firestore is available');
            }
          }
        ` }}/>

        {/* Initialize Firebase immediately */}
        <script dangerouslySetInnerHTML={{ __html: `
          // Initialize Firebase with hardcoded config
          try {
            if (typeof firebase !== 'undefined') {
              const firebaseConfig = {
                apiKey: "AIzaSyAYLQoJRCZ9ynyASEQ0zNWez9GUeNG4qsg",
                authDomain: "aafairshare-37271.firebaseapp.com",
                projectId: "aafairshare-37271",
                storageBucket: "aafairshare-37271.appspot.com",
                messagingSenderId: "121020031141",
                appId: "1:121020031141:web:c56c04b654aae5cfd76d4c"
              };

              // Check if Firebase is already initialized
              if (!firebase.apps || !firebase.apps.length) {
                try {
                  window.firebase = firebase;
                  firebase.initializeApp(firebaseConfig);
                  console.log('Firebase initialized in head script');

                  // Verify Firebase services are available
                  if (typeof firebase.auth !== 'function') {
                    console.error('Firebase Auth is not available');
                  }

                  if (typeof firebase.firestore !== 'function') {
                    console.error('Firebase Firestore is not available');
                  }

                } catch (initError) {
                  console.error('Error initializing Firebase in head script:', initError);
                }
              } else {
                console.log('Firebase already initialized');
              }
            } else {
              console.error('Firebase SDK not loaded');
            }
          } catch (error) {
            console.error('Error in Firebase initialization script:', error);
          }
        ` }}/>
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
            // Add error to DOM for visibility
            var errorContainer = document.getElementById('root-error-messages') || document.createElement('div');
            if (!errorContainer.id) {
              errorContainer.id = 'root-error-messages';
              errorContainer.style.padding = '20px';
              errorContainer.style.margin = '20px';
              errorContainer.style.border = '1px solid red';
              errorContainer.style.borderRadius = '5px';
              errorContainer.style.backgroundColor = '#fff8f8';
              document.body.appendChild(errorContainer);
            }

            var errorElement = document.createElement('div');
            errorElement.innerHTML = '<h3 style="margin-top: 10px; color: red;">Error:</h3><pre style="white-space: pre-wrap; overflow: auto; max-height: 200px; padding: 10px; background-color: #f5f5f5;">' + error.message + '\n' + (error.stack || '') + '</pre>';
            errorContainer.appendChild(errorElement);
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

      // Check if Firebase is available globally
      if (typeof window !== 'undefined') {
        // Log debugging info if available
        if (window.debugInfo) {
          console.log('Debug info:', window.debugInfo);
        }

        if (window.firebase) {
          console.log('Firebase is available globally');
          setFirebaseInitialized(true);
        } else {
          console.error('Firebase is NOT available globally - this will cause issues');
          setInitError(new Error('Firebase is not available globally'));
        }
      }
    } catch (error) {
      console.error('Error in root component initialization:', error);
      setInitError(error instanceof Error ? error : new Error(String(error)));
    }
  }, []); // Empty dependency array - run once on mount

  // Second effect: Handle ENV setup, Firebase initialization, and service worker
  useEffect(() => {
    if (!isClient) return; // Only run on client

    try {
      // Make environment variables available to the client if not already set
      if (data && data.ENV && typeof window !== 'undefined' && !window.ENV) {
        window.ENV = data.ENV;
        console.log('ENV set from loader data');

        // Initialize Firebase with the ENV variables
        if (window.firebase && !firebase.apps.length) {
          try {
            const firebaseConfig = {
              apiKey: data.ENV.FIREBASE_API_KEY,
              authDomain: data.ENV.FIREBASE_AUTH_DOMAIN,
              projectId: data.ENV.FIREBASE_PROJECT_ID,
              storageBucket: data.ENV.FIREBASE_STORAGE_BUCKET,
              messagingSenderId: data.ENV.FIREBASE_MESSAGING_SENDER_ID,
              appId: data.ENV.FIREBASE_APP_ID,
              measurementId: data.ENV.FIREBASE_MEASUREMENT_ID
            };

            window.firebase.initializeApp(firebaseConfig);
            console.log('Firebase initialized with ENV variables');
            setFirebaseInitialized(true);
          } catch (firebaseError) {
            console.error('Failed to initialize Firebase with ENV variables:', firebaseError);
            window.debugInfo.errors.push('Failed to initialize Firebase with ENV: ' + String(firebaseError));
          }
        }
      } else if (typeof window !== 'undefined' && window.ENV) {
        console.log('ENV already set in window');
      } else if (data && !data.ENV) {
        console.error('ENV data is missing in loader data');
        setInitError(new Error('ENV data is missing in loader data'));
      }

      // Initialize Firebase with hardcoded config if not already initialized
      if (window.firebase && !firebase.apps.length && !window.firebase.apps.length) {
        try {
          const firebaseConfig = {
            apiKey: "AIzaSyAYLQoJRCZ9ynyASEQ0zNWez9GUeNG4qsg",
            authDomain: "aafairshare-37271.firebaseapp.com",
            projectId: "aafairshare-37271",
            storageBucket: "aafairshare-37271.appspot.com",
            messagingSenderId: "121020031141",
            appId: "1:121020031141:web:c56c04b654aae5cfd76d4c"
          };

          window.firebase.initializeApp(firebaseConfig);
          console.log('Firebase initialized with hardcoded config as fallback');
          setFirebaseInitialized(true);
        } catch (firebaseError) {
          console.error('Failed to initialize Firebase with hardcoded config:', firebaseError);
          window.debugInfo.errors.push('Failed to initialize Firebase with hardcoded config: ' + String(firebaseError));
        }
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
      console.error('Error in ENV setup:', error);
      setInitError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [data, isClient]);

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
