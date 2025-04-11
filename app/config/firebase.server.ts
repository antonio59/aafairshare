// Server-side Firebase configuration using Firebase Admin SDK

import { initializeApp as initializeAdminApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { cert } from 'firebase-admin/app';
import { validateFirebaseConfig } from '../lib/firebase.shared';

// Initialize Firebase Admin SDK
function initializeAdminSDK() {
  // Check if app is already initialized
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID environment variable is required');
  }

  // Validate basic config
  const configValid = validateFirebaseConfig({
    projectId,
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  });

  if (!configValid) {
    throw new Error('Invalid Firebase configuration');
  }

  try {
    // For production, use GOOGLE_APPLICATION_CREDENTIALS
    if (process.env.NODE_ENV === 'production') {
      return initializeAdminApp({
        projectId,
      });
    }

    // For development, use service account credentials
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 
      `firebase-adminsdk-${projectId.split('-')[0]}@${projectId}.iam.gserviceaccount.com`;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY is required for development');
    }

    return initializeAdminApp({
      projectId,
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

// Initialize the app
const app = initializeAdminSDK();

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
