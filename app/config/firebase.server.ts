// This file contains server-side Firebase configuration
// It's used to initialize Firebase Admin SDK for server-side operations

import { initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { cert } from 'firebase-admin/app';

let app;
try {
  // Initialize Firebase Admin with service account if not already initialized
  // For production, use the GOOGLE_APPLICATION_CREDENTIALS environment variable
  // which should point to a service account key file
  if (process.env.NODE_ENV === 'production') {
    app = initializeAdminApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } else {
    // For development, we can use the service account credentials directly
    // This is useful for local development where the environment variable might not be set
    app = initializeAdminApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || `firebase-adminsdk-${process.env.FIREBASE_PROJECT_ID?.split('-')[0]}@${process.env.FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
        // In a real app, you would use a proper private key
        // For now, we're using a placeholder that will work for development
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || 'placeholder-key',
      }),
    });
  }
} catch (error: any) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
  // If the app is already initialized, get the existing app
  app = initializeAdminApp();
}

// Export the admin auth and firestore instances
export const adminAuth = getAdminAuth(app);
export const adminDb = getAdminFirestore(app);

// Helper functions for server-side operations

// Verify a user's ID token
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
}

// Get a user by ID
export async function getUserById(uid: string) {
  try {
    const userRecord = await adminAuth.getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}
