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
  // Add definitions for other global properties we removed from other files
  handleReactError: (error: Error) => void;
  debugInfo?: {
    timestamp: string;
    userAgent: string;
    url: string;
    errors: string[];
  };
  // Add other potential globals if needed (e.g., firebase if you intended a global instance, though modular is preferred)
  // firebase?: any;
  // queryClient?: any;
  // __remixContext?: any;
}
