import React, { useEffect, useState } from "react";

// Ensure TypeScript knows about window.__remixRouter
declare global {
  interface Window {
    __remixRouter?: any;
  }
}
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { auth, db, firebase, initializeFirebase } from "~/lib/firebase";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export async function loader() { // Added async keyword
  return json({
    timestamp: new Date().toISOString(),
    serverEnv: {
      NODE_ENV: process.env.NODE_ENV,
      hasFirebaseConfig: !!process.env.FIREBASE_API_KEY,
    },
  });
}

export default function DebugPage() {
  const data = useLoaderData<typeof loader>();
  const [clientInfo, setClientInfo] = useState<Record<string, any>>({});
  const [firebaseStatus, setFirebaseStatus] = useState<string>("Not tested");
  const [consoleOutput, setConsoleOutput] = useState<Array<{ message: string; isError: boolean }>>([]);

  // Log to both console and state
  const log = (message: string, isError = false) => {
    console.log(message);
    setConsoleOutput((prev) => [...prev, { message, isError }]);
  };

  useEffect(() => {
    // Gather client-side information
    setClientInfo({
      windowEnv: typeof window !== "undefined" && window.ENV ? "Available" : "Not available",
      firebase: typeof window !== "undefined" && window.firebase ? "Available" : "Not available",
      location: typeof window !== "undefined" ? window.location.href : "N/A",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
      platform: typeof navigator !== "undefined" ? navigator.platform : "N/A",
      language: typeof navigator !== "undefined" ? navigator.language : "N/A",
      cookiesEnabled: typeof navigator !== "undefined" ? navigator.cookieEnabled : "N/A",
      online: typeof navigator !== "undefined" ? navigator.onLine : "N/A",
      remixRouter: typeof window !== "undefined" && window.__remixRouter ? "Available" : "Not available",
    });

    log("Debug page loaded");
  }, []);

  // Test Firebase
  const testFirebase = async () => {
    try {
      if (typeof window === "undefined") {
        log("Cannot test Firebase on server", true);
        setFirebaseStatus("Server-side rendering");
        return;
      }

      if (!window.firebase) {
        log("Firebase is not available globally", true);
        setFirebaseStatus("Not available");

        // Try to initialize Firebase
        try {
          log("Attempting to initialize Firebase...");
          initializeFirebase();
          log("Firebase initialization attempt completed");

          if (window.firebase) {
            log("Firebase is now available after initialization");
            setFirebaseStatus("Available (after initialization)");
          } else {
            log("Firebase is still not available after initialization attempt", true);
            setFirebaseStatus("Initialization failed");
          }
        } catch (initError: any) {
          log(`Firebase initialization error: ${initError.message}`, true);
          setFirebaseStatus("Initialization error");
        }
        return;
      }

      log("Firebase is available globally");
      log(`Firebase version: ${firebase.SDK_VERSION || "Unknown"}`);

      // Test Firestore
      try {
        const testDoc = await db.collection("test").doc("debug-test").set({
          test: "This is a test from debug page",
          timestamp: new Date(),
        });
        log("Successfully wrote to Firestore");
        setFirebaseStatus("Working correctly");
      } catch (firestoreError: any) {
        log(`Firestore test error: ${firestoreError.message}`, true);
        setFirebaseStatus("Firestore error");
      }
    } catch (error: any) {
      log(`Firebase test error: ${error.message}`, true);
      setFirebaseStatus("Test error");
    }
  };

  // Test authentication
  const testAuth = async () => {
    try {
      if (typeof window === "undefined") {
        log("Cannot test auth on server", true);
        return;
      }

      const user = auth.currentUser;
      if (user) {
        log(`Currently signed in as: ${user.email}`);
      } else {
        log("Not currently signed in");
      }
    } catch (error: any) {
      log(`Auth test error: ${error.message}`, true);
    }
  };

  // Clear cache
  const clearCache = () => {
    try {
      if (typeof window === "undefined") {
        log("Cannot clear cache on server", true);
        return;
      }

      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear caches if available
      if ('caches' in window) {
        window.caches.keys().then(function(names) {
          for (let name of names) {
            window.caches.delete(name);
          }
          log("Browser caches cleared");
        });
      }

      log("Local storage and session storage cleared");
    } catch (error: any) {
      log(`Clear cache error: ${error.message}`, true);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-blue-500 mb-6 pb-2 border-b">AAFairShare Debug Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Server Information</CardTitle>
            <CardDescription>Information from the server-side loader</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Timestamp:</strong> {data.timestamp}</div>
              <div><strong>Node Environment:</strong> {data.serverEnv.NODE_ENV}</div>
              <div><strong>Firebase Config:</strong> {data.serverEnv.hasFirebaseConfig ? "Available" : "Not available"}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Information from the browser environment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(clientInfo).map(([key, value]) => (
                <div key={key}><strong>{key}:</strong> {String(value)}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Firebase Status</CardTitle>
          <CardDescription>Current status: <span className={firebaseStatus.includes("error") || firebaseStatus === "Not available" ? "text-red-500 font-semibold" : firebaseStatus === "Working correctly" ? "text-green-500 font-semibold" : "font-semibold"}>{firebaseStatus}</span></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={testFirebase}>Test Firebase</Button>
            <Button onClick={testAuth}>Test Authentication</Button>
            <Button onClick={clearCache} variant="outline">Clear Cache</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Console Output</CardTitle>
          <CardDescription>Log messages from debug operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md max-h-80 overflow-y-auto">
            {consoleOutput.length === 0 ? (
              <div className="text-gray-500 italic">No output yet. Run tests to see results.</div>
            ) : (
              <div className="space-y-2 font-mono text-sm">
                {consoleOutput.map((entry, index) => (
                  <div key={index} className={entry.isError ? "text-red-500" : "text-gray-800 dark:text-gray-200"}>
                    {entry.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
